import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path';

// Dedicated Vitest config (separate from Vite) must still register the SvelteKit plugin
// so .svelte files are transformed. The earlier parse error happened because the plugin
// was missing AND 'mode' was referenced out of scope.
export default defineConfig(({ mode }) => ({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    reporters: ['default', 'html'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/client',
      all: true,
      include: ['src/client/**/*.{ts,svelte}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/test/**',
        '**/*.test.ts',
        '**/*.test-harness.ts',
        '**/*.spec.ts',
        '**/vitest.setup.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@server': path.resolve(__dirname, 'src/server'),
      '@client': path.resolve(__dirname, 'src/client')
    },
    conditions: mode === 'test' ? ['browser'] : []
  }
}));