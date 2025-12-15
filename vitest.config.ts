import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules", "dist", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
