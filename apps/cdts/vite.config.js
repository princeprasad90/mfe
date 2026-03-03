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
        "./bootstrap": "./src/bootstrap.js"
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
    modulePreload: false,
    cssCodeSplit: false
  }
});
