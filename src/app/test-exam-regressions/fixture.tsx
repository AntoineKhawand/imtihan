"use client";

import { useEffect, useState } from "react";
import { ExerciseCard } from "@/components/ui/ExerciseCard";
import { Select } from "@/components/ui/WorkflowSelect";
import type { Exercise } from "@/types/exam";

const methodology = String.raw`Étape 6 (B.3) : Sens de variation et limite.

Pour tout $n \in \mathbb{N}$ : $u\_{n+1} - u_n = (2^{n+3} - 3) - (2^{n+2} - 3) = 2^{n+3} - 2^{n+2} = 2^{n+2}(2 - 1) = 2^{n+2} > 0$.

Donc $(u_n)$ est strictement croissante.

De plus, $\lim\_{n \to +\infty} 2^{n+2} = +\infty$, donc $\lim\_{n \to +\infty} u_n = $\boxed{+\infty}`;

const initial: Exercise = {
  id: "qa-exam", number: 1, type: "problem_solving", difficulty: "hard", points: 5,
  statement: "Étudier la suite $u_n = 2^{n+2} - 3$.",
  solution: { finalAnswer: String.raw`$\lim_{n\to+\infty}u_n=$\boxed{+\infty}`, methodology },
  chapterIds: [], estimatedMinutes: 10,
};

/** Development-only real component harness. AI/provider output is deterministic,
 * and deliberately does not call Firebase, generation APIs or real accounts. */
export function ExamRegressionFixture() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [exercise, setExercise] = useState(initial);
  const [selection, setSelection] = useState("french");
  const [request, setRequest] = useState("");
  const [dark, setDark] = useState(false);
  const transform: NonNullable<React.ComponentProps<typeof ExerciseCard>["onTransform"]> = async (id, mode, prompt) => {
    setRequest(JSON.stringify({ id, mode, prompt }));
    const output: Record<typeof mode, string> = {
      table: "\n\n| n | u_n |\n| --- | --- |\n| 0 | 1 |\n| 1 | 5 |",
      plot: "\n\n[PLOT: x^2]",
      insertPlot: "\n\n[PLOT: x^2]",
      visual: "\n\n```mermaid\nflowchart TD\nA[Suite] --> B[Strictement croissante]\n```",
      image: "\n\n[IMAGE: Classroom illustration]",
    };
    setExercise((previous) => ({ ...previous, statement: previous.statement + output[mode] }));
  };
  return <main data-qa-ready={ready} className="min-h-screen bg-[var(--bg)] p-4 sm:p-8 text-[var(--text)]">
    <div className="mx-auto max-w-4xl space-y-6">
      <h1>Exam QA — mocked provider, real components</h1>
      <button onClick={() => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); document.documentElement.setAttribute("data-theme", next ? "dark" : "light"); }}>Toggle theme</button>
      <Select label="Exam language" value={selection} onChange={(event) => setSelection(event.target.value)} options={[
        { value: "french", label: "Français" }, { value: "unavailable", label: "Unavailable", disabled: true },
        { value: "english", label: "English" }, ...Array.from({ length: 25 }, (_, i) => ({ value: `language-${i}`, label: `Long curriculum option ${i + 1}` })),
      ]} />
      <output data-testid="selected-language">{selection}</output>
      <output data-testid="transform-request" className="block break-all">{request}</output>
      <ExerciseCard exercise={exercise} index={0} language="french" subject="mathematics" defaultShowSolution onRegenerate={async () => undefined} onRemove={() => undefined} onUpdate={setExercise} onTransform={transform} />
    </div>
  </main>;
}
