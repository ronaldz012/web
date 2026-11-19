// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// PUBLIC_SITE decide qué sitio carga esta plantilla (siteSettings + documentos
// con `site` apuntando a él). Un deploy por sitio; mismo código.
// projectId/dataset con defaults públicos para que el build nunca dependa de
// variables no cargadas.
export default defineConfig({
  integrations: [
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID || '58e2e82h',
      dataset: env.PUBLIC_SANITY_DATASET || 'demo_web',
      useCdn: false, // Build estático: siempre contenido publicado fresco
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
