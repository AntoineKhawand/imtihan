import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

// No credentialed dev API helpers, account mutations or external providers.
const phases = [
  ["TypeScript", "node_modules/typescript/bin/tsc", "--noEmit"],
  ["Unit and mocked integration tests", "node_modules/vitest/vitest.mjs", "run", "--maxWorkers=2"],
  ["Independent browser acceptance", "node_modules/@playwright/test/cli.js", "test", "--config=playwright.fix.config.ts"],
];
for (const [label, executable, ...args] of phases) {
  console.log(`\nQA phase: ${label}`);
  const result = spawnSync(process.execPath, [resolve(executable), ...args], { stdio: "inherit", env: process.env });
  if (result.error || result.status !== 0) {
    console.error(`QA blocked: ${label} did not pass. Do not push or deploy.`);
    if (result.error) console.error(result.error.message);
    process.exit(result.status || 1);
  }
}
console.log("\nAutomated QA passed. Independent QA must review these results and any real-provider limitations before push/deploy.");
