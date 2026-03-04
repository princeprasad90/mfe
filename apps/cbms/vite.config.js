import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import postcssMfeScope from "../../packages/build-tools/postcss-mfe-scope.js";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    federation({
      name: "cbmsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./bootstrap": "./src/bootstrap.ts"
      },
      shared: ["react", "react-dom"]
    })
  ],
  css: {
    postcss: {
      plugins: [
        postcssMfeScope({ scope: 'cbms' })
      ]
    }
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    cors: true
  },
  preview: {
    port: 3001,
    cors: true
  },
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false
  }
});
