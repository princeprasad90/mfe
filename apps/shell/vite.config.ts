import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        productsAngular:
          "https://mfe-products-angular.vercel.app/assets/remoteEntry.js"
      }
    })
  ],
  build: {
    target: "esnext",
    modulePreload: false
  }
});
