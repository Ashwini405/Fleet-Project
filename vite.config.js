import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom", "react-router-dom"],
          "vendor-ui":     ["framer-motion", "lucide-react", "react-icons"],
          "vendor-charts": ["recharts"],
          "vendor-xlsx":   ["xlsx"],
          "vendor-qr":     ["qrcode.react", "html5-qrcode"],
          "vendor-axios":  ["axios"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
