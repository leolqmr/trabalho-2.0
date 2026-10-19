import { AppException } from '@/common/exceptions/app.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { UsuarioService } from './usuario.service';

const TURMA_ID = '11111111-1111-4111-8111-111111111111';

function setup(turmaExists = true) {
  const prisma = {
    turma: { findUnique: vi.fn().mockResolvedValue(turmaExists ? { id: TURMA_ID } : null) },
    aluno: { upsert: vi.fn().mockResolvedValue({}) },
  };
  const keycloak = {
    createUser: vi.fn().mockResolvedValue({ id: 'kc-1' }),
    deleteUser: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    listUsers: vi.fn().mockResolvedValue([
      {
        id: '2',
        username: 'user',
        email: 'user@dev.local',
        name: 'Zed',
        enabled: true,
        roles: ['sys_sistema-users'],
      },
      {
        id: '1',
        username: 'admin',
        email: 'admin@dev.local',
        name: 'Admin',
        enabled: true,
        roles: ['sys_sistema-admin', 'sys_sistema-users'],
      },
      { id: '3', username: 'x', email: null, name: 'Nada', enabled: false, roles: [] },
    ]),
  };
  // biome-ignore lint/suspicious/noExplicitAny: mocks
  const service = new UsuarioService(prisma as any, keycloak as any);
  return { prisma, keycloak, service };
}

const base = { name: 'Ana Souza', email: 'ana@x.com', password: '123456' };

describe('UsuarioService', () => {
  it('professor recebe as roles de admin e users', async () => {
    const { service, keycloak } = setup();
    await service.create({ ...base, perfil: 'PROFESSOR' });
    expect(keycloak.createUser.mock.calls[0][0].roles).toEqual([
      'sys_sistema-admin',
      'sys_sistema-users',
    ]);
  });

  it('aluno recebe só a role users e é matriculado na turma com o mesmo e-mail', async () => {
    const { service, keycloak, prisma } = setup();
    const r = await service.create({ ...base, perfil: 'ALUNO', turma_id: TURMA_ID });
    expect(keycloak.createUser.mock.calls[0][0].roles).toEqual(['sys_sistema-users']);
    expect(prisma.aluno.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { turma_id: TURMA_ID, name: 'Ana Souza', email: 'ana@x.com' },
      }),
    );
    expect(r.turma_id).toBe(TURMA_ID);
  });

  it('turma inexistente: 404 e nenhum login é criado', async () => {
    const { service, keycloak } = setup(false);
    await expect(
      service.create({ ...base, perfil: 'ALUNO', turma_id: TURMA_ID }),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(keycloak.createUser).not.toHaveBeenCalled();
  });

  it('turma_id é ignorado para professor', async () => {
    const { service, prisma } = setup();
    await service.create({ ...base, perfil: 'PROFESSOR', turma_id: TURMA_ID });
    expect(prisma.aluno.upsert).not.toHaveBeenCalled();
  });

  it('lista os logins classificando por perfil e ordenando por nome', async () => {
    const { service } = setup();
    const r = await service.findAll();
    expect(r.map((u) => [u.name, u.perfil])).toEqual([
      ['Admin', 'PROFESSOR'],
      ['Nada', 'SEM_PERFIL'],
      ['Zed', 'ALUNO'],
    ]);
  });

  it('apaga o login de outra pessoa', async () => {
    const { service, keycloak } = setup();
    await service.remove('outro', 'eu');
    expect(keycloak.deleteUser).toHaveBeenCalledWith('outro');
  });

  it('não deixa o professor apagar o próprio login', async () => {
    const { service, keycloak } = setup();
    await expect(service.remove('eu', 'eu')).rejects.toBeInstanceOf(AppException);
    expect(keycloak.deleteUser).not.toHaveBeenCalled();
  });

  it('redefine a senha', async () => {
    const { service, keycloak } = setup();
    await service.resetPassword('u1', 'nova123');
    expect(keycloak.resetPassword).toHaveBeenCalledWith('u1', 'nova123');
  });
});
