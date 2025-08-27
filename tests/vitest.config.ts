import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./setup.mjs'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    sequence: {
      hooks: 'stack'
    }
  }
});