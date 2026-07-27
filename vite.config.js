import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/miling": {
        target:
          "https://script.google.com/macros/s/AKfycbyhvp4QYamq0xhSA6ZdwvOTsnaAbfKl8sw6J_RjGGE00O4yHJCTvhUe1tfUT2MR7A78yA/exec",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/miling/, "")
      },
      "/api/district4": {
        target:
          "https://script.google.com/macros/s/AKfycbxgjvQUYNBY5tCfufH2RV03dw9Nr6juE1Ks3uefXuYrkcH2D7mjPDHy9LCSm7IITivR/exec",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/district4/, "")
      },
      "/api/district3": {
        target:
          "https://script.google.com/macros/s/AKfycbzHDKXz0VW0S5XQp29iXCuWItPXPmF-X-9rDlNHPnikVYi0WMKKatgcXRi6fivYBWQJgQ/exec",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/district3/, "")
      },
      "/api/holyspirit": {
        target:
          "https://script.google.com/macros/s/AKfycbxkYOjPjlKvQxPMZg3aSnw1CZV4yDdP0eI42_C-Rwjgg75UokVS8s2b6AeEvSZ4ZMNuAA/exec",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/holyspirit/, "")
      },
      "/api/jmc": {
        target:
          "https://script.google.com/macros/s/AKfycbwyMl6M_Rkv-0fCwj0-N8YRYONY2TqP8-D4Qiazi_0_cYpu_RYb89ToVLPEEtoR71Pg/exec",

        changeOrigin: true,
        secure: true,

        rewrite: (path) =>
          path.replace(/^\/api\/jmc/, ""),
      },
    }
  }
});