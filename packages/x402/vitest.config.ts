import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.mjs', // Exclude circuit test files
      '**/*.spec.mjs',
      '**/circuits/**/*.mjs', // Exclude all .mjs files in circuits directory
    ],
    include: [
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  },
});