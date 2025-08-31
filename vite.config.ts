import { sveltekit } from '@sveltejs/kit/vite';
//import { defineConfig } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		strictPort: false,
	},
	resolve: {
		alias: {
			'@shared': './src/shared'
		},
		conditions: mode === 'test' ? ['browser'] : [],
	},
	test: {
		environment: 'jsdom',
		setupFiles: './vitest.setup.ts',
	},
}));

console.log("Vite config loaded");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("defineConfig:", defineConfig);