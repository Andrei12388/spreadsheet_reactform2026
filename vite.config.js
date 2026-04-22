import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwkxaVGrRBLN1lEi6VB1giE_3vytql_qk-C_4b9703mWkVWU11z_mpOXycPMxe4xanVvw/exec";

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