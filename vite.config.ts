import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `raw/` holds ~50 MB of NASA source files that are research inputs, not runtime
// assets. They are never imported, so they stay out of the bundle by default.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
