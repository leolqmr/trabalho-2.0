import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, KeyRound, RefreshCw } from 'lucide-react';
import { toast } from '@cincoders/cinnamon';
import { chamadaCodigoService, type ChamadaCodigoAluno as Chamada } from '../chamada-codigo.service';

function JanelaAluno({ chamada, agora, onRegistro }: { chamada: Chamada; agora: number; onRegistro: () => void }) {
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const segundos = Math.max(0, Math.ceil((new Date(chamada.expiraEm).getTime() - agora) / 1000));
  const tempo = `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;

  const registrar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (codigo.length !== 8 || segundos === 0 || enviando || chamada.registrada) return;
    setEnviando(true);
    try {
      await chamadaCodigoService.registrar(chamada.id, codigo);
      setCodigo('');
      toast.success('Presença registrada com sucesso!');
      onRegistro();
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha ao registrar presença.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{chamada.aula.turma.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Aula de {new Date(chamada.aula.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400"><Clock3 className="h-4 w-4" /> {tempo}</span>
      </div>
      {chamada.registrada ? (
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400"><CheckCircle2 className="h-5 w-5" /> Sua presença já foi registrada nesta aula.</p>
      ) : segundos > 0 ? (
        <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => void registrar(e)}>
          <label className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Código informado pelo professor
            <input
              aria-label={`Código da turma ${chamada.aula.turma.name}`}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={8}
              pattern="[A-HJ-NP-Z]{8}"
              placeholder="8 letras"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z]/g, '').slice(0, 8))}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono tracking-widest text-gray-900 focus:border-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <button disabled={enviando || codigo.length !== 8} type="submit" className="self-end rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{enviando ? 'Registrando…' : 'Confirmar presença'}</button>
        </form>
      ) : <p className="mt-3 text-sm text-gray-500">O prazo desta chamada terminou.</p>}
    </div>
  );
}

export function ChamadaCodigoAluno() {
  const [chamadas, setChamadas] = useState<Chamada[]>([]);
  const [agora, setAgora] = useState(Date.now());
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    try {
      const resposta = await chamadaCodigoService.abertas();
      setChamadas(resposta);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao consultar chamadas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
    const relogio = window.setInterval(() => setAgora(Date.now()), 1000);
    const atualizacao = window.setInterval(() => { void recarregar(); }, 5000);
    return () => { window.clearInterval(relogio); window.clearInterval(atualizacao); };
  }, [recarregar]);

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900" aria-label="Chamadas abertas">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100"><KeyRound className="h-5 w-5 text-red-600" /> Registrar presença</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Digite a chave de oito letras dita pelo professor antes que o tempo acabe.</p>
        </div>
        <button type="button" onClick={() => void recarregar()} title="Atualizar chamadas" className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><RefreshCw className="h-4 w-4" /></button>
      </div>
      {erro ? <p role="alert" className="text-sm text-red-600">{erro}</p> : carregando ? (
        <p className="text-sm text-gray-500">Buscando chamadas abertas…</p>
      ) : chamadas.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">Nenhuma chamada aberta para suas turmas no momento.</p>
      ) : (
        <div className="space-y-3">{chamadas.map((chamada) => <JanelaAluno key={chamada.id} chamada={chamada} agora={agora} onRegistro={() => void recarregar()} />)}</div>
      )}
    </section>
  );
}
