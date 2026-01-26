import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "cbmsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./CbmsApp": "./src/CbmsApp.tsx"
      },
      shared: ["react", "react-dom", "@mfe/notification-sdk"]
    })
  ],
  server: {
    port: 3001
  },
  build: {
    target: "esnext"
  }
});
