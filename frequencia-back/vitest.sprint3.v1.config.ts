import path from 'node:path';
import { defineConfig } from 'vitest/config';

/** O mesmo escopo de cinco arquivos será usado na v2. */
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/v1-llm/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportsDirectory: '../docs/testes/relatorios/reconstrucao/v1',
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
