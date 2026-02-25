import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "cdtsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./CdtsApp": "./src/CdtsApp.tsx"
      },
      shared: ["react", "react-dom", "@mfe/notification-sdk"]
    })
  ],
  server: {
    port: 3002,
    origin: "http://localhost:3002"
  },
  build: {
    target: "esnext"
  }
});
