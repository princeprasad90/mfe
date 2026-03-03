import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      shared: ["react", "react-dom", "react-router-dom"]
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  preview: {
    port: 3000
  },
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false
  }
});
