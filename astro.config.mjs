import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

const SITE_URL = process.env.SITE_URL || 'https://www.gunanandnagarkar.com';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [tailwind(), sitemap()]
});
