import { RegistrarPresencasSchema } from './registrar-presencas.dto';

const ID_A = '22222222-2222-4222-8222-222222222222';
const ID_B = '33333333-3333-4333-8333-333333333333';

describe('RegistrarPresencasSchema', () => {
  it('aceita uma chamada válida', () => {
    const result = RegistrarPresencasSchema.safeParse({
      presencas: [
        { user_id: ID_A, present: true },
        { user_id: ID_B, present: false },
      ],
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ['lista vazia', { presencas: [] }],
    ['sem o campo presencas', {}],
    ['user_id que não é UUID', { presencas: [{ user_id: 'abc', present: true }] }],
    ['present que não é boolean', { presencas: [{ user_id: ID_A, present: 'sim' }] }],
    [
      'aluno repetido',
      {
        presencas: [
          { user_id: ID_A, present: true },
          { user_id: ID_A, present: false },
        ],
      },
    ],
  ])('rejeita %s', (_nome, body) => {
    expect(RegistrarPresencasSchema.safeParse(body).success).toBe(false);
  });
});
