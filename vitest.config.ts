import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"],
    // firestore.rules.test.ts needs a live Firestore emulator on
    // 127.0.0.1:8080 (see `npm run test:rules`) and fails every case with a
    // connection error otherwise — it has its own config (vitest.rules.config.ts)
    // and must not be swept up by the default `npm test` / `npm run test:watch`.
    exclude: ["**/node_modules/**", "src/__tests__/firestore.rules.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
