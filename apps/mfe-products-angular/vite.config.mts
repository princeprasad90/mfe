import { defineConfig } from "vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  base: "./",
  plugins: [
    federation({
      name: "productsAngular",
      filename: "remoteEntry.js",
      exposes: {
        "./bootstrap": "./src/bootstrap.ts"
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 3003,
    cors: true
  },
  preview: {
    port: 4173,
    cors: true
  },
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false
  }
});
