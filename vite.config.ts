import { defineConfig } from 'vite';

const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
});
