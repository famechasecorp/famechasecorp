import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Note: do NOT import server at top-level. Dynamically import createServer only when
// running the dev server (apply: 'serve') so bundlers (esbuild) won't try to parse
// server/package.json during production builds.

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
    strictPort: true,
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env": {},
  },
});
