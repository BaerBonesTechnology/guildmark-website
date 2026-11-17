import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: { "import.meta.env.VITE_API_URL": JSON.stringify("/api") },
  test: { environment: "jsdom", clearMocks: true },
});
