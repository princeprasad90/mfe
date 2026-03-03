import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    federation({
      name: "cdtsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./CdtsApp": "./src/CdtsApp.tsx"
      },
      shared: {
        react: {
          singleton: true,
          import: false,
          requiredVersion: false,
          generate: false
        },
        "react-dom": {
          singleton: true,
          import: false,
          requiredVersion: false,
          generate: false
        }
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 3002,
    cors: true
  },
  preview: {
    cors: true
  },
  build: {
    target: "esnext",
    modulePreload: false
  }
});
