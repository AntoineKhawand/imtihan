/**
 * Curriculum data model — the foundation of the entire app.
 * If a chapter isn't defined here, Claude shouldn't generate exercises for it.
 */

export type CurriculumId = "bac-libanais" | "bac-francais" | "ib" | "university";

export type Language = "french" | "english" | "arabic";

export type Subject =
  // Sciences
  | "mathematics"
  | "physics"
  | "chemistry"
  | "biology"
  | "svt"                     // Sciences de la Vie et de la Terre
  | "informatics"             // Computer Science / Informatique
  | "nsi"                     // Numérique et Sciences Informatiques (Bac Français)
  | "environmental-systems"   // IB Environmental Systems & Societies
  // Humanities & Social Sciences
  | "history"
  | "geography"
  | "history-geography"
  | "philosophy"
  | "civic-education"
  | "economics"
  | "ses"                     // Sciences Économiques et Sociales (Bac Français)
  | "sociology"
  | "psychology"
  | "global-politics"         // IB Global Politics
  | "law"
  // Languages
  | "arabic"
  | "french"
  | "english"
  | "spanish"
  | "german"
  // Business & Management
  | "accounting"
  | "management"
  | "business"
  // Arts
  | "visual-arts"
  | "music"
  // University / Professional
  | "medicine"
  | "engineering"
  | "architecture"
  | "nursing";

export interface Chapter {
  id: string;
  name: {
    fr: string;
    en: string;
    ar?: string;
  };
  /** Learning objectives — what a teacher can reasonably test */
  objectives: string[];
  /** Cross-reference to related chapters (prerequisites or follow-ups) */
  related?: string[];
}

export interface Level {
  id: string;
  name: {
    fr: string;
    en: string;
    ar?: string;
  };
  /** Chapters by subject */
  chapters: Partial<Record<Subject, Chapter[]>>;
}

export interface Curriculum {
  id: CurriculumId;
  name: {
    fr: string;
    en: string;
    ar?: string;
  };
  /** Default exam language for this curriculum */
  defaultLanguage: Language;
  /** Supported languages */
  languages: Language[];
  /** Supported subjects */
  subjects: Subject[];
  levels: Level[];
}
