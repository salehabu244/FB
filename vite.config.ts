import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Bloom & Beyond — bouquet ordering platform.
// `netlify dev` serves the Vite app together with the Netlify Functions
// so that /api/* endpoints work during local development.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
  },
});
