"use client";
import { useState } from "react";
import { ExerciseEditor } from "@/components/ui/ExerciseEditor";
import { Exercise, ExamContext } from "@/types/exam";

const dummyContext: ExamContext = {
  curriculumId: "bac-libanais",
  levelId: "terminale-s",
  subject: "mathematics",
  chapterIds: [],
  language: "french",
  examType: "practice",
  duration: 60,
  exerciseCount: 1,
  totalPoints: 20,
  difficultyMix: { easy: 0.3, medium: 0.4, hard: 0.3 },
};

const dummyExercise: Exercise = {
  id: "test1",
  number: 1,
  type: "problem_solving",
  statement: "Calculate $x^2 + y^2 = z^2$ and verify the **bold** text.",
  points: 10,
  difficulty: "medium",
  solution: {
    finalAnswer: "$z = \\sqrt{x^2 + y^2}$",
    methodology: "1. Square $x$\n2. Square $y$\n3. Sum them\n4. Take square root",
  },
  chapterIds: [],
  estimatedMinutes: 10,
};

export default function TestWysiwyg() {
  const [ex, setEx] = useState(dummyExercise);
  const [open, setOpen] = useState(true);
  
  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Test WYSIWYG</h1>
      <button id="open-editor" onClick={() => setOpen(true)}>Open Editor</button>
      <div id="result" data-testid="result-data">{JSON.stringify(ex)}</div>
      {open && (
        <ExerciseEditor
          exercise={ex}
          context={dummyContext}
          onSave={(updated) => { setEx(updated); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
