#!/usr/bin/env node
/**
 * Runs the next Playwright phase spec in e2e/phases/ (rotating, wraps after
 * the last one), then updates summary.md's table row and Run Log for that
 * phase. Intended to be invoked once per day by a scheduled task.
 *
 * Usage: node scripts/run-daily-phase.mjs [phaseNumber]
 *   With no argument, advances the rotation automatically using
 *   e2e/phases/.state.json. Pass a phase number (1-8) to force a specific
 *   phase without disturbing the rotation pointer.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PHASES_DIR = path.join(ROOT, "e2e", "phases");
const STATE_FILE = path.join(PHASES_DIR, ".state.json");
const SUMMARY_FILE = path.join(ROOT, "summary.md");

function listPhaseFiles() {
  const files = fs
    .readdirSync(PHASES_DIR)
    .filter((f) => /^phase-\d+-.*\.spec\.ts$/.test(f))
    .map((f) => {
      const num = parseInt(f.match(/^phase-(\d+)-/)[1], 10);
      return { num, file: f };
    })
    .sort((a, b) => a.num - b.num);
  if (files.length === 0) throw new Error(`No phase-*.spec.ts files found in ${PHASES_DIR}`);
  return files;
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { lastIndex: -1 };
  }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

function pickPhase(phases, forcedNum) {
  if (forcedNum != null) {
    const found = phases.find((p) => p.num === forcedNum);
    if (!found) throw new Error(`Phase ${forcedNum} not found among: ${phases.map((p) => p.num).join(", ")}`);
    return { phase: found, index: phases.indexOf(found) };
  }
  const state = readState();
  const index = (state.lastIndex + 1) % phases.length;
  return { phase: phases[index], index };
}

function runPlaywright(specFile) {
  const jsonOut = path.join(os.tmpdir(), `imtihan-phase-report-${Date.now()}.json`);
  const relSpec = path.join("e2e", "phases", specFile);

  const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["playwright", "test", relSpec, "--reporter=list,json"],
    {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: jsonOut },
    }
  );

  let stats = { expected: 0, unexpected: 0, flaky: 0, skipped: 0 };
  try {
    const report = JSON.parse(fs.readFileSync(jsonOut, "utf8"));
    if (report.stats) stats = report.stats;
  } catch {
    // json reporter may not have written a file if playwright itself crashed
  } finally {
    fs.rm(jsonOut, { force: true }, () => {});
  }

  return { exitCode: result.status ?? 1, stats };
}

function updatePhaseRow(content, phaseNum, lastRunStr, statusStr, resultStr) {
  const rowRegex = new RegExp(`^\\|\\s*${phaseNum}\\s*\\|([^|]*)\\|([^|]*)\\|([^|]*)\\|([^|]*)\\|([^|]*)\\|$`, "m");
  if (!rowRegex.test(content)) {
    console.warn(`Warning: could not find table row for phase ${phaseNum} in summary.md`);
    return content;
  }
  return content.replace(rowRegex, (_m, phaseName, covers) => {
    return `| ${phaseNum} |${phaseName}|${covers}| ${lastRunStr} | ${statusStr} | ${resultStr} |`;
  });
}

function prependRunLog(content, entry) {
  const marker = "*(newest first — appended automatically by `scripts/run-daily-phase.mjs`)*";
  const idx = content.indexOf(marker);
  if (idx === -1) return content + `\n\n## Run Log\n\n${entry}\n`;
  const afterMarker = idx + marker.length;
  const rest = content.slice(afterMarker);
  const cleanedRest = rest.replace(/\n+- No runs yet\.\n/, "\n");
  return content.slice(0, afterMarker) + `\n\n${entry}` + cleanedRest;
}

function main() {
  const forcedArg = process.argv[2];
  const forcedNum = forcedArg ? parseInt(forcedArg, 10) : null;

  const phases = listPhaseFiles();
  const { phase, index } = pickPhase(phases, forcedNum);
  const phaseName = phase.file.replace(/^phase-\d+-/, "").replace(/\.spec\.ts$/, "").replace(/-/g, " ");

  console.log(`\n=== Running Phase ${phase.num} (${phase.file}) ===\n`);
  const start = Date.now();
  const { exitCode, stats } = runPlaywright(phase.file);
  const durationSec = ((Date.now() - start) / 1000).toFixed(1);

  if (forcedNum == null) {
    writeState({ lastIndex: index });
  }

  const passed = stats.expected ?? 0;
  const failed = stats.unexpected ?? 0;
  const flaky = stats.flaky ?? 0;
  const skipped = stats.skipped ?? 0;
  const ok = exitCode === 0;

  const now = new Date();
  const lastRunStr = now.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const statusStr = ok ? "✅ Passing" : "❌ Failing";
  const resultParts = [`${passed} passed`, `${failed} failed`];
  if (flaky) resultParts.push(`${flaky} flaky`);
  if (skipped) resultParts.push(`${skipped} skipped`);
  const resultStr = resultParts.join(", ");

  let summary = fs.readFileSync(SUMMARY_FILE, "utf8");
  summary = updatePhaseRow(summary, phase.num, lastRunStr, statusStr, resultStr);
  const logEntry = `- ${lastRunStr} — Phase ${phase.num} (${phaseName}): ${ok ? "✅" : "❌"} ${resultStr} (${durationSec}s)`;
  summary = prependRunLog(summary, logEntry);
  fs.writeFileSync(SUMMARY_FILE, summary);

  console.log(`\n=== Phase ${phase.num} done: ${resultStr} in ${durationSec}s ===\n`);
  process.exit(exitCode);
}

main();
