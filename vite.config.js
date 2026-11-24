import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  envDir: false,
  envPrefix: "LOA_DEMO_",
  server: { host: "127.0.0.1", port: 4178, strictPort: true },
  preview: { host: "127.0.0.1", port: 4178, strictPort: true },
  build: { outDir: "dist", sourcemap: false, rollupOptions: { output: { manualChunks: { "react-runtime": ["react", "react-dom"], "mui-controls": ["@mui/material"] } } } },
});
