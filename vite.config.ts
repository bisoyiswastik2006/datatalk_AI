import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ['plotly.js-dist-min', 'react-plotly.js'],
          vendor: ['react', 'react-dom', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 3500,
  },
  server: {
    port: 5173,
    host: true,
  },
});
