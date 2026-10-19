import { registerAs } from '@nestjs/config';

export default registerAs('keycloak', () => ({
  authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL ?? '',
  realm: process.env.KEYCLOAK_REALM ?? '',
  // clientId esperado na claim `azp`/`aud` do token (opcional, para validação de audiência)
  clientId: process.env.KEYCLOAK_CLIENT_ID ?? '',
  jwksCacheMaxAge: Number.parseInt(process.env.KEYCLOAK_JWKS_CACHE_MAX_AGE ?? '600000', 10),
  // Timeout (ms) ao buscar o JWKS; evita travar a requisição se o Keycloak estiver lento.
  // Credenciais para a Admin API do Keycloak (criação de logins). Em dev: admin do realm master.
  adminUser: process.env.KEYCLOAK_ADMIN_USER ?? '',
  adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD ?? '',
  jwksTimeout: Number.parseInt(process.env.KEYCLOAK_JWKS_TIMEOUT ?? '5000', 10),
}));
