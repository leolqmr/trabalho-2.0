import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RouteMap from './routes';
import type { AuthContextProps } from 'react-oidc-context';

const mockUseAuth = vi.fn();
vi.mock('react-oidc-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock turma service to avoid network calls during router tests
vi.mock('./modules/turmas/turma.service', () => ({
  turmaService: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock frequencia service (área do aluno) to avoid network calls during router tests
vi.mock('./modules/frequencia/frequencia.service', () => ({
  frequenciaService: {
    getMinha: vi.fn().mockResolvedValue([]),
    getDoAluno: vi.fn().mockResolvedValue(null),
  },
}));

// Mock todo service to avoid network calls during router tests
vi.mock('./modules/todos/todo.service', () => ({
  todoService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

/** Monta um access_token JWT falso com roles */
function fakeToken(roles: string[]): string {
  const payload = btoa(JSON.stringify({ realm_access: { roles } }));
  return `header.${payload}.sig`;
}

describe('<RouteMap>', () => {
  let mockSigninRedirect: ReturnType<typeof vi.fn>;
  let mockEvents: {
    addAccessTokenExpired: ReturnType<typeof vi.fn>;
    removeAccessTokenExpired: ReturnType<typeof vi.fn>;
    addSilentRenewError: ReturnType<typeof vi.fn>;
    removeSilentRenewError: ReturnType<typeof vi.fn>;
    addUserSignedOut: ReturnType<typeof vi.fn>;
    removeUserSignedOut: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSigninRedirect = vi.fn();
    mockEvents = {
      addAccessTokenExpired: vi.fn(),
      removeAccessTokenExpired: vi.fn(),
      addSilentRenewError: vi.fn(),
      removeSilentRenewError: vi.fn(),
      addUserSignedOut: vi.fn(),
      removeUserSignedOut: vi.fn(),
    };
    window.history.pushState({}, 'Test', '/');
  });

  it('renderiza a tela de login na rota / quando o usuário NÃO está autenticado e não redireciona', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      activeNavigator: undefined,
      user: null,
      signinRedirect: mockSigninRedirect,
      events: mockEvents,
    } as unknown as AuthContextProps);

    render(<RouteMap />);

    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(mockSigninRedirect).not.toHaveBeenCalled();
  });

  it('redireciona o ALUNO (role users) para /minha-frequencia quando está autenticado', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeNavigator: undefined,
      user: {
        access_token: fakeToken(['sys_sistema-users']),
        profile: {
          email: 'user@cin.ufpe.br',
          given_name: 'Test User',
          preferred_username: 'testuser',
        },
      },
      signinRedirect: mockSigninRedirect,
      signinSilent: vi.fn().mockResolvedValue(null),
      events: mockEvents,
    } as unknown as AuthContextProps);

    render(<RouteMap />);

    expect(
      await screen.findByRole('heading', { name: 'Minha frequência' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^entrar$/i })).toBeNull();
    expect(mockSigninRedirect).not.toHaveBeenCalled();
  });

  it('redireciona o PROFESSOR (role admin) para /turmas quando está autenticado', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeNavigator: undefined,
      user: {
        access_token: fakeToken(['sys_sistema-admin']),
        profile: { email: 'prof@cin.ufpe.br' },
      },
      signinRedirect: mockSigninRedirect,
      signinSilent: vi.fn().mockResolvedValue(null),
      events: mockEvents,
    } as unknown as AuthContextProps);

    render(<RouteMap />);

    expect(await screen.findByRole('heading', { name: 'Turmas' })).toBeInTheDocument();
  });

  it('bloqueia a área do professor (/turmas) para o aluno e mostra a ForbiddenPage', async () => {
    window.history.pushState({}, 'Test', '/turmas');

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeNavigator: undefined,
      user: {
        access_token: fakeToken(['sys_sistema-users']),
        profile: { email: 'aluno@cin.ufpe.br' },
      },
      signinRedirect: mockSigninRedirect,
      signinSilent: vi.fn().mockResolvedValue(null),
      events: mockEvents,
    } as unknown as AuthContextProps);

    render(<RouteMap />);

    expect(await screen.findByText(/You are logged in as/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Turmas' })).toBeNull();
  });

  it('chama signinRedirect ao clicar no botão Entrar na tela de login', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      activeNavigator: undefined,
      user: null,
      signinRedirect: mockSigninRedirect,
      events: mockEvents,
    } as unknown as AuthContextProps);

    render(<RouteMap />);

    const button = screen.getByRole('button', { name: /entrar/i });
    button.click();

    expect(mockSigninRedirect).toHaveBeenCalledTimes(1);
  });

  it('bloqueia /usuarios para usuário autenticado sem a role ADMIN (mostra ForbiddenPage)', async () => {
    window.history.pushState({}, 'Test', '/usuarios');

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeNavigator: undefined,
      user: {
        access_token: fakeToken(['sys_sistema-editor']),
        profile: { email: 'editor@cin.ufpe.br' },
      },
      signinRedirect: mockSigninRedirect,
      signinSilent: vi.fn().mockResolvedValue(null),
      events: mockEvents,
    } as unknown as AuthContextProps);

    render(<RouteMap />);

    expect(await screen.findByText(/You are logged in as/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Logins' })).toBeNull();
  });

  it('libera /usuarios para usuário ADMIN', async () => {
    window.history.pushState({}, 'Test', '/usuarios');

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      activeNavigator: undefined,
      user: {
        access_token: fakeToken(['sys_sistema-admin']),
        profile: { email: 'admin@cin.ufpe.br' },
      },
      signinRedirect: mockSigninRedirect,
      signinSilent: vi.fn().mockResolvedValue(null),
      events: mockEvents,
    } as unknown as AuthContextProps);

    render(<RouteMap />);

    expect(
      await screen.findByRole('heading', { name: 'Logins' }),
    ).toBeInTheDocument();
  });

  it('redireciona para / e exibe tela de login quando usuário não autenticado tenta acessar /todos', () => {
    window.history.pushState({}, 'Test', '/todos');

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      activeNavigator: undefined,
      user: null,
      signinRedirect: mockSigninRedirect,
      events: mockEvents,
    } as unknown as AuthContextProps);

    render(<RouteMap />);

    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(mockSigninRedirect).not.toHaveBeenCalled();
  });
});

