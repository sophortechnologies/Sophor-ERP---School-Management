import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5190,
    open: true,
    host: true, // Add this to allow external access
    fs: {
      strict: false, // Allow serving files from outside root
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        // Add rewrite if needed
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/billing": {
        target: "http://localhost:5000", // Add proxy for billing endpoints
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Use path.resolve for proper aliasing
    },
  },
  // ADD THIS SECTION TO FIX THE 504 ERROR
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-hot-toast",
      "axios",
      "lucide-react",
      "date-fns",
      "@reduxjs/toolkit",
      "react-redux",
    ],
    exclude: [], // Add any problematic packages here
    force: true, // Force dependency pre-bundling
  },
  // Add build configuration for better performance
  build: {
    target: "es2020",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "react-hot-toast"],
          utils: ["axios", "date-fns"],
          state: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
  },
  // Clear Vite cache on start
  clearScreen: false,
});
