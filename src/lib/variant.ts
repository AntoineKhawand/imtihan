import type { Exercise } from "@/types/exam";

/**
 * Deterministic PRNG seeded from a string (mulberry32 on xfnv1a hash).
 * Same seed → same shuffle, so a teacher's Version B is stable per exam.
 */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Produce a Version B by reordering exercises and sub-questions.
 * Same total points, same content, same difficulty mix — only order changes.
 * Deterministic per exam id so re-exporting gives the same Version B.
 */
export function buildVersionB(exercises: Exercise[], seed: string): Exercise[] {
  const rand = mulberry32(hashSeed(seed + "-vB"));

  const shuffled = shuffle(exercises, rand);

  return shuffled.map((ex, i) => ({
    ...ex,
    number: i + 1,
    subQuestions: ex.subQuestions && ex.subQuestions.length > 1
      ? relabelSubQuestions(shuffle(ex.subQuestions, rand))
      : ex.subQuestions,
  }));
}

function relabelSubQuestions(subs: NonNullable<Exercise["subQuestions"]>): NonNullable<Exercise["subQuestions"]> {
  const firstLabel = subs[0]?.label ?? "a)";
  const isAlpha = /[a-zA-Z]/.test(firstLabel);
  return subs.map((sq, i) => ({
    ...sq,
    label: isAlpha
      ? `${String.fromCharCode(97 + i)})`
      : `${i + 1}.`,
  }));
}
