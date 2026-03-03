import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    federation({
      name: "cbmsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./CbmsApp": "./src/CbmsApp.tsx"
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
    port: 3001,
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
