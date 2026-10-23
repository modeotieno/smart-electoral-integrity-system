import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "Smart Electoral Integrity System",
        short_name: "SEIS",
        description:
          "A secure platform for transparent, verifiable and trustworthy digital elections.",
        theme_color: "#071426",
        background_color: "#071426",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//]
      }
    }),

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
      }
    }
  ],

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true
      }
    }
  },

  build: {
    outDir: "dist"
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"]
  }
});
