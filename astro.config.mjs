import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    prerenderEnvironment: 'node',
  }),
  integrations: [
    sanity({
      projectId: '0cn4widw',
      dataset: 'production',
      useCdn: false,
    }),
  ],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
