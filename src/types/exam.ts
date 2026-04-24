import type { CurriculumId, Language, Subject } from "./curriculum";

export type ExamType =
  | "quiz"
  | "homework"
  | "midterm"
  | "final"
  | "practice"
  | "dawrat";

export type Difficulty = "easy" | "medium" | "hard";

export type ExerciseType =
  | "multiple_choice"
  | "short_answer"
  | "problem_solving"
  | "proof"
  | "essay"
  | "calculation"
  | "lab_analysis";

/**
 * ExamContext — the structured intent for what to generate.
 * Produced by /api/analyze from a teacher's natural-language description + uploaded docs.
 */
export interface ExamContext {
  curriculumId: CurriculumId;
  levelId: string;
  subject: Subject;
  chapterIds: string[];
  language: Language;
  examType: ExamType;
  /** Duration in minutes */
  duration: number;
  /** Total number of exercises */
  exerciseCount: number;
  /** Total points (usually 20 in French system, 100 in IB) */
  totalPoints: number;
  /** Difficulty mix — must sum to 1.0 */
  difficultyMix: {
    easy: number;
    medium: number;
    hard: number;
  };
  /** Teacher's additional context — verbatim from their description */
  teacherNotes?: string;
  /** True if teacher wants two equivalent versions for anti-cheating */
  generateVersionB?: boolean;
  /** Analysis of the visual/formatting style if a document was provided */
  layoutPreferences?: string;
  /** Preferences for graphs, diagrams, or visual aids */
  visualPreference?: string;
}

export interface Exercise {
  id: string;
  /** Order in the exam, 1-indexed */
  number: number;
  type: ExerciseType;
  difficulty: Difficulty;
  points: number;
  /** The statement in markdown (LaTeX supported with $...$ and $$...$$) */
  statement: string;
  /** Optional: sub-questions */
  subQuestions?: Array<{
    label: string; // "a)", "b)", "1.", etc.
    statement: string;
    points: number;
  }>;
  /** The answer + full methodology */
  solution: {
    finalAnswer: string;
    methodology: string; // step-by-step reasoning in markdown
    commonMistakes?: string[];
  };
  /** Which curriculum chapters this exercise tests */
  chapterIds: string[];
  /** Estimated time for a student to solve, in minutes */
  estimatedMinutes: number;
}

export interface Exam {
  id: string;
  ownerId: string;
  title: string;
  context: ExamContext;
  exercises: Exercise[];
  /** School name / class name — user-editable header info */
  header?: {
    schoolName?: string;
    className?: string;
    teacherName?: string;
    date?: string;
  };
  versionB?: Exam;
  createdAt: number;
  updatedAt: number;
  /** Template used for rendering */
  templateId: string;
  tags: string[];
}

/** Validation result from /api/analyze */
export interface AnalyzeResult {
  success: boolean;
  context?: ExamContext;
  /** Warnings — things Claude inferred but isn't 100% sure about */
  warnings?: string[];
  /** Errors — reasons we couldn't produce a context */
  errors?: string[];
}
