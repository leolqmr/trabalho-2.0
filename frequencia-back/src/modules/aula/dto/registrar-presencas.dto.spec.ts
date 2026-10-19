import { RegistrarPresencasSchema } from './registrar-presencas.dto';

describe('RegistrarPresencasSchema', () => {
  it('aceita uma chamada válida e normaliza o e-mail', () => {
    const result = RegistrarPresencasSchema.safeParse({
      presencas: [
        { email: '  Ana@CIn.UFPE.br ', present: true },
        { email: 'bruno@cin.ufpe.br', present: false },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.presencas[0].email).toBe('ana@cin.ufpe.br');
  });

  it.each([
    ['lista vazia', { presencas: [] }],
    ['sem o campo presencas', {}],
    ['e-mail inválido', { presencas: [{ email: 'abc', present: true }] }],
    ['present que não é boolean', { presencas: [{ email: 'a@b.com', present: 'sim' }] }],
    [
      'aluno repetido (mesmo e-mail, mesmo com caixa diferente)',
      {
        presencas: [
          { email: 'a@b.com', present: true },
          { email: 'A@B.com', present: false },
        ],
      },
    ],
  ])('rejeita %s', (_nome, body) => {
    expect(RegistrarPresencasSchema.safeParse(body).success).toBe(false);
  });
});
