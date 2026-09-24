import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { proxy: { "/api": "http://localhost:3000" } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          map: ["leaflet", "react-leaflet"],
          charts: ["recharts"],
          core: [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-query",
          ],
        },
      },
    },
  },
});
