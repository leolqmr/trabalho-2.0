import { CreateAlunoSchema } from './create-aluno.dto';

describe('CreateAlunoSchema', () => {
  it('aceita nome e e-mail, normalizando o e-mail', () => {
    const result = CreateAlunoSchema.safeParse({ name: ' Ana Souza ', email: ' Ana@CIn.UFPE.br ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: 'Ana Souza', email: 'ana@cin.ufpe.br' });
    }
  });

  it.each([
    ['nome vazio', { name: '  ', email: 'a@b.com' }],
    ['e-mail inválido', { name: 'Ana', email: 'ana' }],
    ['sem e-mail', { name: 'Ana' }],
  ])('rejeita %s', (_nome, body) => {
    expect(CreateAlunoSchema.safeParse(body).success).toBe(false);
  });
});
