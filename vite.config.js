import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbw27WsSfSa1I61vxeScMoejyWLm6CY2QaoFImfjylGyHDgHEwEOaXUujDGWgTSdtzHG/exec";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: GAS_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
});