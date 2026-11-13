import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Mesma seleção de fontes da v1; somente o conjunto de testes muda.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/v2/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportOnFailure: true,
      reportsDirectory: '../docs/testes/relatorios/v2',
      include: [
        'src/modules/chamada-codigo/chamada-codigo.service.ts',
        'src/modules/chamada-codigo/dto/abrir-chamada-codigo.dto.ts',
        'src/modules/chamada-codigo/dto/registrar-codigo.dto.ts',
        'src/modules/frequencia/frequencia.util.ts',
      ],
      exclude: [],
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
