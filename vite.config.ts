import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        port: 5173,
        strictPort: false,
    },
    resolve: {
        alias: {
            '@shared': './src/shared',
            '@server': './src/server',
            '@client': './src/client'
        }
    }
});

console.log("Vite config loaded");
console.log("NODE_ENV:", process.env.NODE_ENV);