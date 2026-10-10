import type { ExamContext } from "@/types/exam";
export const HARD_DIFFICULTY: ExamContext["difficultyMix"] = {
  easy: 0,
  medium: 0,
  hard: 1,
};
export const DIFFICULTY_PRESETS = {
  hard: HARD_DIFFICULTY,
  medium: { easy: 0, medium: 1, hard: 0 },
  easy: { easy: 1, medium: 0, hard: 0 },
  mixed: { easy: 0.2, medium: 0.45, hard: 0.35 },
} as const;
export function normalizeDifficulty(mix?: ExamContext["difficultyMix"]) {
  if (
    !mix ||
    Object.values(mix).some((value) => !Number.isFinite(value) || value < 0)
  )
    return { ...HARD_DIFFICULTY };
  const sum = mix.easy + mix.medium + mix.hard;
  return sum > 0
    ? { easy: mix.easy / sum, medium: mix.medium / sum, hard: mix.hard / sum }
    : { ...HARD_DIFFICULTY };
}
export function difficultyPreset(mix: ExamContext["difficultyMix"]) {
  return (
    Object.entries(DIFFICULTY_PRESETS).find(
      ([, preset]) =>
        Math.abs(mix.easy - preset.easy) < 0.001 &&
        Math.abs(mix.medium - preset.medium) < 0.001 &&
        Math.abs(mix.hard - preset.hard) < 0.001,
    )?.[0] ?? "custom"
  );
}
