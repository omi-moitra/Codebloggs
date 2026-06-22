import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.VITE_API_BASE_URL || "http://localhost:5050";
  const devServerPort = Number(env.VITE_DEV_SERVER_PORT || 3000);

  return {
    plugins: [react()],
    server: {
      port: devServerPort,
      proxy: {
        "/record": apiBaseUrl,
      },
    },
  };
});
