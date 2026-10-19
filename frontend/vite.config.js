import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "suppress-benign-ws-proxy-reset",
      configResolved(config) {
        const logger = config.logger;
        const originalError = logger.error.bind(logger);
        logger.error = (msg, opts) => {
          if (
            typeof msg === "string" &&
            msg.includes("ws proxy socket error") &&
            msg.includes("ECONNRESET")
          ) {
            return;
          }
          return originalError(msg, opts);
        };
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
  },
});
