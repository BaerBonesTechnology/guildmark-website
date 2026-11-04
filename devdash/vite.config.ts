import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  // Dev traffic always goes through Vite, independent of stale Doppler URLs.
  define: command === 'serve' ? { 'import.meta.env.VITE_API_URL': JSON.stringify('/api') } : undefined,
  envDir: process.env.GM_LOCAL_STACK === 'true' ? false : undefined,
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: process.env.GM_LOCAL_API_TARGET ?? 'http://127.0.0.1:8080', changeOrigin: true },
    },
    port: 3001,
  },
}));
