import { defineConfig } from 'vite';
import path from 'node:path';

// https://vitejs.dev/config
// Tailwind v4 is handled via postcss.config.cjs
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
});
