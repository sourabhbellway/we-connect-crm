import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all addresses for LAN access
    proxy: {
      "/api": { target: 'http://127.0.0.1:3010', changeOrigin: true },
      "/uploads": { target: "http://localhost:3010", changeOrigin: true },
    },
  },
  optimizeDeps: { exclude: ["lucide-react"] },
});
