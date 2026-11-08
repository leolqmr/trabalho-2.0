import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Copy, KeyRound, RefreshCw, StopCircle } from 'lucide-react';
import { toast } from '@cincoders/cinnamon';
import {
  chamadaCodigoService,
  type ChamadaCodigoAberta,
  type EstadoChamadaCodigo,
} from '../chamada-codigo.service';

export function ChamadaCodigoProfessor({ aulaId, onAlteracao }: { aulaId: string; onAlteracao: () => void }) {
  const [estado, setEstado] = useState<EstadoChamadaCodigo | null>(null);
  const [aberta, setAberta] = useState<ChamadaCodigoAberta | null>(null);
  const [duracao, setDuracao] = useState(3);
  const [ocupado, setOcupado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [agora, setAgora] = useState(Date.now());

  const carregar = useCallback(async () => {
    try {
      const resposta = await chamadaCodigoService.status(aulaId);
      setEstado(resposta);
      if (!resposta?.ativa) setAberta(null);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao carregar a chamada.');
    } finally {
      setCarregando(false);
    }
  }, [aulaId]);

  useEffect(() => {
    void carregar();
    const relogio = window.setInterval(() => setAgora(Date.now()), 1000);
    const atualizacao = window.setInterval(() => { void carregar(); }, 5000);
    return () => { window.clearInterval(relogio); window.clearInterval(atualizacao); };
  }, [carregar]);

  const restantes = Math.max(0, Math.ceil((new Date(estado?.expiraEm ?? 0).getTime() - agora) / 1000));
  const ativa = Boolean(estado?.ativa && restantes > 0 && !estado?.encerradoEm);
  const formatoTempo = `${String(Math.floor(restantes / 60)).padStart(2, '0')}:${String(restantes % 60).padStart(2, '0')}`;

  const abrir = async () => {
    if (ativa && !window.confirm('Gerar outro código invalida o atual. Continuar?')) return;
    setOcupado(true);
    try {
      const resposta = await chamadaCodigoService.abrir(aulaId, duracao);
      setAberta(resposta);
      setAgora(Date.now());
      await carregar();
      toast.success('Chamada por código aberta!');
      onAlteracao();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao abrir a chamada.');
    } finally {
      setOcupado(false);
    }
  };

  const encerrar = async () => {
    setOcupado(true);
    try {
      await chamadaCodigoService.encerrar(aulaId);
      setAberta(null);
      await carregar();
      onAlteracao();
      toast.success('Chamada encerrada.');
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao encerrar a chamada.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900" aria-label="Chamada por código">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <KeyRound className="h-5 w-5 text-red-600" /> Chamada automática por código
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Dite a chave para os alunos presentes. O prazo é validado no servidor.</p>
        </div>
        {ativa ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
            <Clock3 className="h-4 w-4" /> Aberta — {formatoTempo}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {carregando ? 'Carregando…' : 'Encerrada'}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Duração
          <select
            value={duracao}
            onChange={(e) => setDuracao(Number(e.target.value))}
            disabled={ocupado}
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800"
          >
            {[1, 2, 3, 5, 10, 15].map((minutos) => <option key={minutos} value={minutos}>{minutos} min</option>)}
          </select>
        </label>
        <button type="button" onClick={() => void abrir()} disabled={ocupado} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
          {ativa ? 'Gerar outro código' : 'Iniciar chamada'}
        </button>
        {ativa && <button type="button" onClick={() => void encerrar()} disabled={ocupado} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"><StopCircle className="h-4 w-4" /> Encerrar agora</button>}
        <button type="button" onClick={() => void carregar()} aria-label="Atualizar chamada por código" className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><RefreshCw className="h-4 w-4" /></button>
      </div>
      {aberta && ativa && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <div className="mb-2 text-xs font-medium text-red-700 dark:text-red-300">Código atual — disponível nesta tela até encerrar ou recarregar</div>
          <div className="flex flex-wrap items-center gap-3">
            <strong className="font-mono text-3xl font-bold tracking-[0.25em] text-gray-900 dark:text-gray-100" aria-label={`Código ${aberta.codigo}`}>{aberta.codigo}</strong>
            <button type="button" className="rounded-lg border border-red-300 bg-white p-2 text-red-700 hover:bg-red-100 dark:bg-gray-900" title="Copiar código" onClick={() => { void navigator.clipboard.writeText(aberta.codigo); toast.success('Código copiado!'); }}><Copy className="h-4 w-4" /></button>
          </div>
        </div>
      )}
      {estado && <p className="mt-4 inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><CheckCircle2 className="h-4 w-4" /> {estado.presentes} aluno(s) com presença registrada nesta aula</p>}
      {ativa && !aberta && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">Uma chamada está aberta, mas o código não pode ser recuperado depois de recarregar. Gere outro código para exibi-lo novamente.</p>}
    </section>
  );
}
