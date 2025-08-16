import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			'@shared': './src/shared',
			'@client': './src/client',
			'@server': './src/server'
		}
	},
	preprocess: vitePreprocess()
};

export default config;
