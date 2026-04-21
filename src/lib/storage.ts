/**
 * Browser localStorage helpers — all reads/writes are SSR-safe.
 * Each function handles JSON parse errors gracefully by returning defaults.
 */

import type { ExamContext, Exercise } from "@/types/exam";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SavedExam {
  id: string;
  title: string;
  context: ExamContext;
  exercises: Exercise[];
  header?: {
    schoolName?: string;
    className?: string;
    teacherName?: string;
    date?: string;
  };
  templateId: string;
  createdAt: number;
  updatedAt: number;
}

export interface BankExercise {
  id: string;
  exercise: Exercise;
  subject: string;
  curriculumId: string;
  language: string;
  savedAt: number;
  tags: string[];
}

export interface ClassProfile {
  id: string;
  name: string; // e.g. "Terminale S · Physique"
  curriculumId: string;
  levelId: string;
  subject: string;
  language: string;
  createdAt: number;
}

export interface SchoolSettings {
  schoolName: string;
  teacherName: string;
}

// ─── Storage keys ───────────────────────────────────────────────────────────

const KEYS = {
  EXAMS: "imtihan_saved_exams",
  BANK: "imtihan_question_bank",
  PROFILES: "imtihan_class_profiles",
  SCHOOL: "imtihan_school_settings",
} as const;

// ─── SSR-safe localStorage accessor ─────────────────────────────────────────

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readJSON<T>(key: string, fallback: T): T {
  const s = getStorage();
  if (!s) return fallback;
  try {
    const raw = s.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  const s = getStorage();
  if (!s) return;
  s.setItem(key, JSON.stringify(value));
}

// ─── Exam Library ────────────────────────────────────────────────────────────

export function getSavedExams(): SavedExam[] {
  return readJSON<SavedExam[]>(KEYS.EXAMS, []);
}

export function saveExam(exam: SavedExam): void {
  const exams = getSavedExams();
  const idx = exams.findIndex((e) => e.id === exam.id);
  if (idx !== -1) {
    exams[idx] = { ...exam, updatedAt: Date.now() };
  } else {
    exams.unshift(exam);
  }
  writeJSON(KEYS.EXAMS, exams);
}

export function deleteExam(id: string): void {
  writeJSON(KEYS.EXAMS, getSavedExams().filter((e) => e.id !== id));
}

export function getExam(id: string): SavedExam | undefined {
  return getSavedExams().find((e) => e.id === id);
}

// ─── Question Bank ───────────────────────────────────────────────────────────

export function getBankExercises(): BankExercise[] {
  return readJSON<BankExercise[]>(KEYS.BANK, []);
}

export function saveToBank(entry: BankExercise): void {
  const bank = getBankExercises();
  // Avoid duplicates by exercise id
  if (bank.some((b) => b.exercise.id === entry.exercise.id)) return;
  bank.unshift(entry);
  writeJSON(KEYS.BANK, bank);
}

export function removeFromBank(id: string): void {
  writeJSON(KEYS.BANK, getBankExercises().filter((b) => b.id !== id));
}

// ─── Class Profiles ──────────────────────────────────────────────────────────

export function getClassProfiles(): ClassProfile[] {
  return readJSON<ClassProfile[]>(KEYS.PROFILES, []);
}

export function saveClassProfile(profile: ClassProfile): void {
  const profiles = getClassProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx !== -1) {
    profiles[idx] = profile;
  } else {
    profiles.unshift(profile);
  }
  writeJSON(KEYS.PROFILES, profiles);
}

export function deleteClassProfile(id: string): void {
  writeJSON(KEYS.PROFILES, getClassProfiles().filter((p) => p.id !== id));
}

// ─── School Settings ─────────────────────────────────────────────────────────

export function getSchoolSettings(): SchoolSettings | null {
  return readJSON<SchoolSettings | null>(KEYS.SCHOOL, null);
}

export function saveSchoolSettings(settings: SchoolSettings): void {
  writeJSON(KEYS.SCHOOL, settings);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a human-readable title for a saved exam */
export function buildExamTitle(context: ExamContext): string {
  const subjectMap: Record<string, string> = {
    mathematics: "Mathématiques", physics: "Physique", chemistry: "Chimie",
    biology: "Biologie", history: "Histoire", geography: "Géographie",
    philosophy: "Philosophie", arabic: "Arabe", french: "Français",
    english: "Anglais", economics: "Économie", accounting: "Comptabilité",
    informatics: "Informatique", "visual-arts": "Arts Plastiques",
    svt: "SVT", nsi: "NSI",
  };
  const subject = subjectMap[context.subject] ?? context.subject;
  return `${subject} — ${context.levelId}`;
}
