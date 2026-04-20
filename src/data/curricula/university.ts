import type { Curriculum } from "@/types/curriculum";

/**
 * University — open-ended curriculum.
 * University teachers describe their own course; the AI uses the teacher's description
 * and any uploaded syllabus as the "curriculum reference."
 * Subjects cover all major university majors in Lebanon and internationally.
 */
export const university: Curriculum = {
  id: "university",
  name: {
    fr: "Université",
    en: "University",
  },
  defaultLanguage: "english",
  languages: ["english", "french", "arabic"],
  subjects: [
    // Sciences & Engineering
    "mathematics", "physics", "chemistry", "biology", "informatics", "engineering", "architecture",
    // Medicine & Health
    "medicine", "nursing",
    // Social Sciences & Humanities
    "economics", "law", "psychology", "sociology", "history", "philosophy",
    // Languages & Literature
    "arabic", "french", "english",
    // Business
    "management", "accounting", "business",
  ],
  levels: [
    {
      id: "l1",
      name: { fr: "Licence 1 (L1)", en: "Undergraduate Year 1" },
      chapters: {},
    },
    {
      id: "l2",
      name: { fr: "Licence 2 (L2)", en: "Undergraduate Year 2" },
      chapters: {},
    },
    {
      id: "l3",
      name: { fr: "Licence 3 (L3)", en: "Undergraduate Year 3" },
      chapters: {},
    },
    {
      id: "m1",
      name: { fr: "Master 1 (M1)", en: "Master Year 1" },
      chapters: {},
    },
    {
      id: "m2",
      name: { fr: "Master 2 (M2)", en: "Master Year 2" },
      chapters: {},
    },
  ],
};
