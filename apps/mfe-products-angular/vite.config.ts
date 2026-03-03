import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    angular(),
    federation({
      name: "productsAngular",
      filename: "remoteEntry.js",
      exposes: {
        "./bootstrap": "./src/bootstrap.ts"
      }
    })
  ],
  base: "./",
  build: {
    target: "esnext",
    cssCodeSplit: false,
    modulePreload: false
  }
});
