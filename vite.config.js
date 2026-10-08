import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const DEV_BACKEND = "http://localhost:5001";

// Pages call the backend with the hardcoded DEV_BACKEND origin. When VITE_API_URL
// is set at build time (e.g. "" on Render, where Express serves this build on the
// same origin), rewrite that origin in the source so the deployed app calls the
// right server. Unset → nothing changes (local development).
function apiOriginPlugin(apiUrl) {
  return {
    name: "api-origin-rewrite",
    enforce: "pre",
    transform(code, id) {
      if (apiUrl === undefined || !id.includes("/src/") || !code.includes(DEV_BACKEND)) return null;
      return { code: code.split(DEV_BACKEND).join(apiUrl.replace(/\/+$/, "")), map: null };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [apiOriginPlugin(env.VITE_API_URL), react()],
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
  };
});
