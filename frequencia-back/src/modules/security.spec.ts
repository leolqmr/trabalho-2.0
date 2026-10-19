import 'reflect-metadata';
import { AccessRole } from '@/common/auth/access-role.enum';
import { ROLES_KEY } from '@/common/auth/decorators/roles.decorator';
import { AulaController } from './aula/aula.controller';
import { TurmaController } from './turma/turma.controller';

const rolesOf = (controller: { prototype: object }, handler: string): AccessRole[] | undefined =>
  Reflect.getMetadata(ROLES_KEY, (controller.prototype as Record<string, object>)[handler]);

describe('Proteção das rotas (guards globais + @Roles)', () => {
  it.each([
    [TurmaController, 'create'],
    [TurmaController, 'update'],
    [TurmaController, 'remove'],
    [AulaController, 'create'],
    [AulaController, 'update'],
    [AulaController, 'remove'],
    [AulaController, 'registrarPresencas'],
    [AulaController, 'removePresenca'],
  ])('%o.%s exige ADMIN', (controller, handler) => {
    expect(rolesOf(controller, handler)).toEqual([AccessRole.ADMIN]);
  });

  it.each([
    [TurmaController, 'findAll'],
    [TurmaController, 'findAlunos'],
    [AulaController, 'findAll'],
    [AulaController, 'findPresencas'],
  ])('%o.%s fica aberta a qualquer usuário autenticado (sem @Roles)', (controller, handler) => {
    expect(rolesOf(controller, handler)).toBeUndefined();
  });
});
