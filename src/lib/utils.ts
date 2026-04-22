import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FREE_EXAM_LIMIT = Number(process.env.NEXT_PUBLIC_FREE_EXAM_LIMIT ?? 3);

export const SUBJECT_LABELS: Record<string, { fr: string; en: string }> = {
  // Sciences
  mathematics: { fr: "Mathématiques", en: "Mathematics" },
  physics: { fr: "Physique", en: "Physics" },
  chemistry: { fr: "Chimie", en: "Chemistry" },
  biology: { fr: "Biologie", en: "Biology" },
  svt: { fr: "Sciences de la Vie et de la Terre (SVT)", en: "Life & Earth Sciences" },
  informatics: { fr: "Informatique", en: "Computer Science" },
  nsi: { fr: "Numérique et Sciences Informatiques (NSI)", en: "Digital Science & CS" },
  "environmental-systems": { fr: "Sciences de l'Environnement", en: "Environmental Systems & Societies" },
  // Humanities & Social Sciences
  history: { fr: "Histoire", en: "History" },
  geography: { fr: "Géographie", en: "Geography" },
  "history-geography": { fr: "Histoire-Géographie", en: "History & Geography" },
  philosophy: { fr: "Philosophie", en: "Philosophy" },
  "civic-education": { fr: "Éducation Civique", en: "Civic Education" },
  economics: { fr: "Économie", en: "Economics" },
  ses: { fr: "Sciences Économiques et Sociales (SES)", en: "Social & Economic Sciences" },
  sociology: { fr: "Sociologie", en: "Sociology" },
  psychology: { fr: "Psychologie", en: "Psychology" },
  "global-politics": { fr: "Politique Mondiale", en: "Global Politics" },
  law: { fr: "Droit", en: "Law" },
  // Languages
  arabic: { fr: "Langue Arabe", en: "Arabic Language" },
  french: { fr: "Langue et Littérature Françaises", en: "French Language & Literature" },
  english: { fr: "Langue Anglaise", en: "English Language" },
  spanish: { fr: "Langue Espagnole", en: "Spanish Language" },
  german: { fr: "Langue Allemande", en: "German Language" },
  // Business & Management
  accounting: { fr: "Comptabilité", en: "Accounting" },
  management: { fr: "Sciences de Gestion", en: "Management" },
  business: { fr: "Gestion et Commerce", en: "Business Studies" },
  // Arts
  "visual-arts": { fr: "Arts Plastiques", en: "Visual Arts" },
  music: { fr: "Musique", en: "Music" },
  // University / Professional
  medicine: { fr: "Médecine", en: "Medicine" },
  engineering: { fr: "Ingénierie", en: "Engineering" },
  architecture: { fr: "Architecture", en: "Architecture" },
  nursing: { fr: "Sciences Infirmières", en: "Nursing" },
};

export const LANGUAGE_LABELS: Record<string, string> = {
  french: "French",
  english: "English",
  arabic: "Arabic",
};

export const EXAM_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  quiz: { fr: "Quiz / Contrôle rapide", en: "Quiz" },
  homework: { fr: "Devoir maison", en: "Homework" },
  midterm: { fr: "Devoir surveillé / Mi-session", en: "Midterm" },
  final: { fr: "Examen final", en: "Final exam" },
  practice: { fr: "Entraînement / Révision", en: "Practice" },
};

export const DIFFICULTY_LABELS: Record<string, { fr: string; en: string }> = {
  easy: { fr: "Facile", en: "Easy" },
  medium: { fr: "Moyen", en: "Medium" },
  hard: { fr: "Difficile", en: "Hard" },
};

/** Format exam duration to human-readable */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

/** Truncate a string to maxLength with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/** Format a unix timestamp as a short date */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-LB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Generate a random short ID for exercises */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}
