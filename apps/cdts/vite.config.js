import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "cdtsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./CdtsApp": "./src/CdtsApp.tsx"
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 3002
  },
  build: {
    target: "esnext"
  }
});
