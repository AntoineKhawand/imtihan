/**
 * Chapter distribution regression test — verifies buildChapterDistribution()
 * (src/lib/prompts/generate.ts) guarantees every selected chapter is mapped
 * to at least one exercise, regardless of how exerciseCount compares to the
 * number of selected chapters. Replicates the algorithm in plain Node.js so
 * it can run without the full Next.js build.
 *
 * Regression for BUG-009 — see BUGS.md.
 *
 * Run:  node test-chapter-distribution.mjs
 */

// ─── Replicated logic (must stay in sync with buildChapterDistribution in generate.ts) ───

function buildChapterDistribution(names, exerciseCount) {
  if (!names.length || exerciseCount < 1) return [];
  const perExercise = Array.from({ length: exerciseCount }, () => []);
  names.forEach((name, idx) => {
    perExercise[idx % exerciseCount].push(name);
  });
  for (let i = names.length; i < exerciseCount; i++) {
    perExercise[i].push(names[i % names.length]);
  }
  return perExercise;
}

// ─── Test cases ──────────────────────────────────────────────────────────────

const TESTS = [
  {
    name: "1. Bug-report shape: more chapters than exercises",
    chapters: ["Mécanique — mouvements dans l'espace", "Électromagnétisme", "Optique", "Thermodynamique"],
    exerciseCount: 3,
  },
  {
    name: "2. More exercises than chapters (evenly divisible)",
    chapters: ["Mécanique", "Électromagnétisme"],
    exerciseCount: 4,
  },
  {
    name: "3. More exercises than chapters (not evenly divisible)",
    chapters: ["Mécanique", "Électromagnétisme", "Optique"],
    exerciseCount: 5,
  },
  {
    name: "4. Exact 1:1 match",
    chapters: ["Mécanique", "Électromagnétisme"],
    exerciseCount: 2,
  },
  {
    name: "5. Single chapter, many exercises",
    chapters: ["Mécanique"],
    exerciseCount: 6,
  },
  {
    name: "6. Six chapters, four exercises (uneven overlap)",
    chapters: ["A", "B", "C", "D", "E", "F"],
    exerciseCount: 4,
  },
  {
    name: "7. Many chapters, single exercise",
    chapters: ["A", "B", "C", "D", "E"],
    exerciseCount: 1,
  },
  {
    name: "8. One chapter, one exercise",
    chapters: ["Only Chapter"],
    exerciseCount: 1,
  },
];

// ─── Runner ──────────────────────────────────────────────────────────────────

console.log("═".repeat(70));
console.log("  Chapter distribution regression test (BUG-009)");
console.log("═".repeat(70));

let passed = 0, failed = 0;

for (const t of TESTS) {
  const result = buildChapterDistribution(t.chapters, t.exerciseCount);
  const issues = [];

  // Every exercise slot must have at least one chapter assigned.
  const emptySlots = result.filter((chs) => chs.length === 0).length;
  if (emptySlots > 0) issues.push(`  ⚠ ${emptySlots} exercise(s) with zero chapters assigned`);

  // Every selected chapter must appear at least once across all exercises.
  const covered = new Set(result.flat());
  const missing = t.chapters.filter((c) => !covered.has(c));
  if (missing.length > 0) issues.push(`  ⚠ chapters never covered: ${missing.join(", ")}`);

  // Exercise count in output must match requested exerciseCount.
  if (result.length !== t.exerciseCount) issues.push(`  ⚠ expected ${t.exerciseCount} exercise slots, got ${result.length}`);

  if (issues.length > 0) {
    failed++;
    console.log(`\n❌ FAIL  ${t.name}`);
    console.log(`   Chapters (${t.chapters.length}): ${t.chapters.join(", ")}`);
    console.log(`   Exercises: ${t.exerciseCount}`);
    result.forEach((chs, i) => console.log(`   Exercise ${i + 1} -> ${chs.join(" + ") || "(none)"}`));
    issues.forEach((i) => console.log(i));
  } else {
    passed++;
    console.log(`✅ PASS  ${t.name}  (${t.chapters.length} chapters → ${t.exerciseCount} exercises, all covered)`);
  }
}

console.log("\n" + "─".repeat(70));
console.log(`Results: ${passed} passed, ${failed} failed out of ${TESTS.length} tests`);
console.log("─".repeat(70));
