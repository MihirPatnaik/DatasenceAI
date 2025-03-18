import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/home/mihir_patnaik/src',
    },
  },
  build: {
    outDir: 'dist',
  },
  esbuild: {
    loader: 'tsx', // Ensure TypeScript (.tsx) files are processed
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
});