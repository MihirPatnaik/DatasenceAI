import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
});