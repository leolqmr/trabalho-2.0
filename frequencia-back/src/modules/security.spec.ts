import 'reflect-metadata';
import { AccessRole } from '@/common/auth/access-role.enum';
import { ROLES_KEY } from '@/common/auth/decorators/roles.decorator';
import { AulaController } from './aula/aula.controller';
import { FrequenciaController } from './frequencia/frequencia.controller';
import { TurmaController } from './turma/turma.controller';
import { UsuarioController } from './usuario/usuario.controller';

const classRoles = (controller: object): AccessRole[] | undefined =>
  Reflect.getMetadata(ROLES_KEY, controller);

const handlerRoles = (controller: { prototype: object }, handler: string) =>
  Reflect.getMetadata(ROLES_KEY, (controller.prototype as Record<string, object>)[handler]);

describe('Proteção das rotas (guards globais + @Roles)', () => {
  it.each([
    ['TurmaController', TurmaController],
    ['AulaController', AulaController],
    ['UsuarioController', UsuarioController],
  ])('%s inteiro é restrito ao professor (ADMIN)', (_nome, controller) => {
    expect(classRoles(controller)).toEqual([AccessRole.ADMIN]);
  });

  it('o detalhe da frequência de um aluno é só do professor', () => {
    expect(handlerRoles(FrequenciaController, 'detalhe')).toEqual([AccessRole.ADMIN]);
  });

  it('GET /me/frequencia fica aberto a qualquer usuário autenticado (o aluno vê só os próprios dados)', () => {
    expect(handlerRoles(FrequenciaController, 'minha')).toBeUndefined();
    expect(classRoles(FrequenciaController)).toBeUndefined();
  });
});
