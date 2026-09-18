import { defineConfig } from "vitest/config";
import path from "path";

// Separate Vitest config for Firestore security-rules tests
// (src/__tests__/firestore.rules.test.ts). Deliberately NOT merged into
// vitest.config.ts: rules tests need a real network connection to a running
// Firestore emulator (127.0.0.1:8080) and a plain Node environment (not
// jsdom), and must never be picked up by the default `npm test` run, which
// has no emulator running and would just fail every case with ECONNREFUSED.
//
// Invoked via `npm run test:rules`, which wraps the vitest call in
// `firebase emulators:exec --only firestore` so the emulator is started
// and torn down automatically.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/__tests__/firestore.rules.test.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
