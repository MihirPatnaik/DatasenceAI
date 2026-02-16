// Vite configuration file: vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';

export default defineConfig({
  base: "/smartsocial/", // ✅ important for correct asset URLs
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Existing alias for DatasenceAI
      '@smartsocial': path.resolve(__dirname, 'src/smartsocial'), // ✅ SmartSocial alias
      '@utils': path.resolve(__dirname, 'src/smartsocial/utils'), // ✅ add this
      '@agents': path.resolve(__dirname, 'src/smartsocial/agents'), // ✅ optional: match tsconfig
      '@server': path.resolve(__dirname, 'src/smartsocial/server'), // ✅ optional: match tsconfig
    },
  },
  build: {
    outDir: 'dist',
  },
  esbuild: {
    loader: 'tsx',
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  server: {
    host: '0.0.0.0',
    hmr: false,

    // ✅ Claude API Proxy to bypass CORS
    proxy: {
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, '/v1/messages'),
      },
    },
  },
});
