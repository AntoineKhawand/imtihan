import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FREE_EXAM_LIMIT = 2;

export const SUBJECT_LABELS: Record<string, { fr: string; en: string; ar: string }> = {
  // Sciences
  mathematics: { fr: "Mathématiques", en: "Mathematics", ar: "الرياضيات" },
  physics: { fr: "Physique", en: "Physics", ar: "الفيزياء" },
  chemistry: { fr: "Chimie", en: "Chemistry", ar: "الكيمياء" },
  biology: { fr: "Biologie", en: "Biology", ar: "علوم الحياة" },
  svt: { fr: "SVT", en: "Life & Earth Sciences", ar: "علوم الحياة والأرض" },
  informatics: { fr: "Informatique", en: "Computer Science", ar: "المعلوماتية" },
  nsi: { fr: "Numérique et Sciences Informatiques (NSI)", en: "Digital Science & CS", ar: "العلوم الرقمية" },
  "environmental-systems": { fr: "Sciences de l'Environnement", en: "Environmental Systems", ar: "العلوم البيئية" },
  // Humanities & Social Sciences
  history: { fr: "Histoire", en: "History", ar: "التاريخ" },
  geography: { fr: "Géographie", en: "Geography", ar: "الجغرافيا" },
  "history-geography": { fr: "Histoire-Géographie", en: "History & Geography", ar: "التاريخ والجغرافيا" },
  philosophy: { fr: "Philosophie", en: "Philosophy", ar: "الفلسفة" },
  "civic-education": { fr: "Éducation Civique", en: "Civic Education", ar: "التربية المدنية" },
  economics: { fr: "Économie", en: "Economics", ar: "الاقتصاد" },
  ses: { fr: "Sciences Économiques et Sociales (SES)", en: "Social & Economic Sciences", ar: "العلوم الاجتماعية والاقتصادية" },
  sociology: { fr: "Sociologie", en: "Sociology", ar: "علم الاجتماع" },
  psychology: { fr: "Psychologie", en: "Psychology", ar: "علم النفس" },
  "global-politics": { fr: "Politique Mondiale", en: "Global Politics", ar: "السياسة العالمية" },
  law: { fr: "Droit", en: "Law", ar: "الحقوق" },
  // Languages
  arabic: { fr: "Langue Arabe", en: "Arabic Language", ar: "اللغة العربية" },
  french: { fr: "Langue et Littérature Françaises", en: "French Language & Literature", ar: "اللغة الفرنسية وآدابها" },
  english: { fr: "Langue Anglaise", en: "English Language", ar: "اللغة الإنجليزية" },
  spanish: { fr: "Langue Espagnole", en: "Spanish Language", ar: "اللغة الإسبانية" },
  german: { fr: "Langue Allemande", en: "German Language", ar: "اللغة الألمانية" },
  // Business & Management
  accounting: { fr: "Comptabilité", en: "Accounting", ar: "المحاسبة" },
  management: { fr: "Sciences de Gestion", en: "Management", ar: "علوم الإدارة" },
  business: { fr: "Gestion et Commerce", en: "Business Studies", ar: "إدارة الأعمال" },
  // Arts
  "visual-arts": { fr: "Arts Plastiques", en: "Visual Arts", ar: "الفنون التشكيلية" },
  music: { fr: "Musique", en: "Music", ar: "الموسيقى" },
  // University / Professional
  medicine: { fr: "Médecine", en: "Medicine", ar: "الطب" },
  engineering: { fr: "Ingénierie", en: "Engineering", ar: "الهندسة" },
  architecture: { fr: "Architecture", en: "Architecture", ar: "الهندسة المعمارية" },
  nursing: { fr: "Sciences Infirmières", en: "Nursing", ar: "التمريض" },
};

export const LANGUAGE_LABELS: Record<string, string> = {
  french: "Français",
  english: "English",
  arabic: "العربية",
};

export const EXAM_TYPE_LABELS: Record<string, { fr: string; en: string; ar: string }> = {
  quiz: { fr: "Quiz / Contrôle rapide", en: "Quiz", ar: "اختبار قصير" },
  homework: { fr: "Devoir maison", en: "Homework", ar: "فرض منزلي" },
  midterm: { fr: "Devoir surveillé", en: "Midterm", ar: "اختبار فصلي" },
  final: { fr: "Examen final", en: "Final exam", ar: "امتحان نهائي" },
  practice: { fr: "Entraînement", en: "Practice", ar: "تدريب" },
};

export const DIFFICULTY_LABELS: Record<string, { fr: string; en: string; ar: string }> = {
  easy: { fr: "Facile", en: "Easy", ar: "سهل" },
  medium: { fr: "Moyen", en: "Medium", ar: "متوسط" },
  hard: { fr: "Difficile", en: "Hard", ar: "صعب" },
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
