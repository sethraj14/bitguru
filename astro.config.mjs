// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), markdoc(), keystatic()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // Externalize keystatic to avoid Vite transform issues
      external: ['@keystatic/core', '@keystatic/astro'],
    },
  },

  adapter: vercel(),
});
