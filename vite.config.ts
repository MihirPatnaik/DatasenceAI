// D:\datasenceai\vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': './src',
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
    host: '0.0.0.0', // Bind to all interfaces to allow network access
    port: 3000,
    strictPort: false,
    open: true,
    hmr: {
      host: '0.0.0.0', // Ensure HMR works over the network
      port: 3000,
      protocol: 'ws',
      overlay: true,
    },
  },
});