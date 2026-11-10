import path from 'node:path';
import { defineConfig } from 'vitest/config';

/** V2 = reprodução íntegra dos testes da V1 + testes EVO, no mesmo escopo de cobertura. */
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/v2/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportsDirectory: '../docs/testes/relatorios/reconstrucao/v2',
      include: [
        'src/modules/chamada-codigo/chamada-codigo.service.ts',
        'src/modules/chamada-codigo/dto/abrir-chamada-codigo.dto.ts',
        'src/modules/chamada-codigo/dto/registrar-codigo.dto.ts',
        'src/modules/frequencia/frequencia.util.ts',
        'src/modules/frequencia/frequencia.service.ts',
      ],
    },
  },
});
