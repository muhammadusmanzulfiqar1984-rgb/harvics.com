import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const isEmbed = process.env.TABRAIZ_EMBED === '1';
  return {
    base: isEmbed ? '/tabraiz-town/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: isEmbed
      ? {
          outDir: path.resolve(__dirname, '../../public/tabraiz-town'),
          emptyOutDir: true,
        }
      : undefined,
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
