import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        cbmsApp: {
          type: "module",
          name: "cbmsApp",
          entry: "http://localhost:3001/assets/remoteEntry.js"
        },
        cdtsApp: {
          type: "module",
          name: "cdtsApp",
          entry: "http://localhost:3002/assets/remoteEntry.js"
        }
      },
      shared: ["react", "react-dom", "@mfe/notification-sdk"]
    })
  ],
  server: {
    port: 3000,
    origin: "http://localhost:3000"
  },
  build: {
    target: "esnext"
  }
});
