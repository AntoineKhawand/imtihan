export interface BlogEditorial {
  title: string;
  description: string;
  keyword: string;
  language: "en" | "fr";
  published: string;
  figure: "blueprint" | "marking" | "data";
  prompt: string;
  review: string;
}

export const BLOG_REFRESH_DATE = "2026-10-12";

// Existing URLs are retained. Each article owns a distinct reader task.
export const BLOG_EDITORIAL: Record<string, BlogEditorial> = {
  "stop-recycled-exams": {
    title: "Create Fresh Practice Questions from Past Exam Papers",
    description:
      "Use past exam papers to identify learning objectives, then create fresh practice questions with new contexts, reviewed difficulty and worked solutions.",
    keyword: "practice questions from past papers",
    language: "en",
    published: "2026-05-01",
    figure: "blueprint",
    prompt:
      "Use my uploaded past paper for exercise inspiration only. Keep the assessed skills, but change the context and values. Require new reasoning, avoid copied wording, and provide a worked answer key. Use only the chapters I select.",
    review:
      "Solve each new question independently. Changing numbers can create an impossible physical situation or accidentally make the original problem much easier.",
  },
  "save-time-teaching": {
    title: "AI Exam Preparation: A Practical Workflow for Teachers",
    description:
      "Reduce repetitive exam preparation with a reusable brief, reviewed AI questions, a worked answer key and editable Word or PDF exports for your classroom.",
    keyword: "AI exam preparation",
    language: "en",
    published: "2026-04-30",
    figure: "blueprint",
    prompt:
      "Create a 45-minute classroom assessment on the chapters I select. Include a clear marks allocation and a worked answer key. Keep each question independent so I can replace one exercise without changing the whole exam.",
    review:
      "Time drafting, checking solutions and formatting separately. Compare your own before-and-after totals; an AI draft still needs a full teacher review.",
  },
  "guide-for-parents": {
    title: "Brevet Practice Exams at Home: A Parent’s Checklist",
    description:
      "Plan a teacher-reviewed Brevet practice exam at home: choose taught chapters, set a realistic timer, review the answers and plan focused follow-up practice.",
    keyword: "Brevet practice exams",
    language: "en",
    published: "2026-04-29",
    figure: "blueprint",
    prompt:
      "Prepare a short revision assessment using only the chapters already taught in class. Separate the student questions from the worked solutions, and ask for an explanation as well as a final answer.",
    review:
      "Ask the subject teacher to check the paper and solutions first. Discuss mistakes without treating one practice score as a prediction of the official result.",
  },
  "exam-standardization": {
    title: "Standardize Exam Difficulty Across Classes: Teacher Guide",
    description:
      "Build a shared assessment blueprint for parallel classes: agree on chapter coverage, difficulty, marks and marking criteria, then review each paper together.",
    keyword: "standardize exam difficulty",
    language: "en",
    published: "2026-04-28",
    figure: "marking",
    prompt:
      "Draft a classroom paper using our shared chapter list, duration, difficulty mix and marks. Include a criterion for every mark. Keep the question contexts new while preserving the agreed assessment objectives.",
    review:
      "Have teachers solve both versions and compare the reasoning demanded. Equal marks and matching chapter labels alone do not establish equal difficulty.",
  },
  "university-assessment-ai": {
    title: "University Exam Generator: Build Syllabus-Based Assessments",
    description:
      "Turn a university maths, physics or chemistry syllabus into a reviewed assessment with explicit prerequisites, multi-part problems and a worked marking guide.",
    keyword: "university exam generator",
    language: "en",
    published: "2026-04-27",
    figure: "marking",
    prompt:
      "Use the uploaded syllabus for content grounding. Assess the listed learning outcomes with one derivation, one application and one interpretation problem. State prerequisites and permitted methods, and include a criterion-based marking guide.",
    review:
      "Check every prerequisite against what was actually taught. Specify conventions, notation and permitted theorems instead of assuming all university courses use the same syllabus.",
  },
  "generate-bac-libanais-chemistry": {
    title: "Bac Libanais Chemistry Exam Generator: Questions & Corrigé",
    description:
      "Prepare a Bac Libanais chemistry practice exam with selected chapters, coherent experimental data, a reviewed marks allocation and a step-by-step corrigé.",
    keyword: "Bac Libanais chemistry exam generator",
    language: "en",
    published: "2026-05-10",
    figure: "data",
    prompt:
      "Create a Bac Libanais chemistry classroom practice paper on the selected chapters. Include an experimental data interpretation exercise, units and a worked corrigé. Let students deduce the result; do not state the conclusion in the data.",
    review:
      "Check reaction equations, units, significant figures and whether the experimental values are physically plausible. Use a teacher-defined or uploaded chemistry composition rather than assuming an official template.",
  },
  "ib-mark-scheme-generator": {
    title: "IB Mark Scheme Generator: Draft and Review Answer Keys",
    description:
      "Draft an IB-style mark scheme with worked reasoning and clear mark allocations. Check command terms and subject-specific rules before using it with students.",
    keyword: "IB mark scheme generator",
    language: "en",
    published: "2026-05-09",
    figure: "marking",
    prompt:
      "Draft an IB-style practice question with its worked solution. Allocate each mark to a distinct criterion. Identify acceptable alternative approaches and flag where I must check error-carried-forward treatment against the current subject guide.",
    review:
      "Check the current IB subject guide and official specimen mark schemes. A generated rubric is a draft, not an IB-approved mark scheme; error-carried-forward rules are subject and question specific.",
  },
  "generate-bac-francais-devoir": {
    title: "Générateur de devoir Bac Français : physique-chimie",
    description:
      "Préparez un devoir de physique-chimie pour le Bac Français avec des chapitres choisis, des données cohérentes et un corrigé à vérifier avant distribution.",
    keyword: "générateur de devoir Bac Français",
    language: "fr",
    published: "2026-05-08",
    figure: "data",
    prompt:
      "Prépare un devoir de physique-chimie sur les chapitres sélectionnés. Propose une analyse de données expérimentales sans révéler la conclusion. Fournis un barème et un corrigé détaillé, avec les unités et les hypothèses nécessaires.",
    review:
      "Vérifiez les calculs, les incertitudes et les compétences évaluées. Pour la composition de physique-chimie, définissez votre structure ou utilisez un document de référence : les profils officiels intégrés ne couvrent pas toutes les matières.",
  },
  "lebanese-teachers-ai-exam-generator": {
    title: "AI Exam Generator in Lebanon: Choose Your Curriculum",
    description:
      "Compare Bac Libanais, Bac Français and IB exam preparation in Imtihan. Choose chapters, review the AI draft and export a classroom-ready exam with answers.",
    keyword: "AI exam generator in Lebanon",
    language: "en",
    published: "2026-05-07",
    figure: "blueprint",
    prompt:
      "Use the curriculum, level and chapters I select. Draft a challenging practice exam in the language of my course. State the marks clearly and include worked solutions that I can check before exporting the student paper.",
    review:
      "Confirm the curriculum and level before generation. Similar chapter names across Bac Libanais, Bac Français and IB can have different depth, notation and assessment expectations.",
  },
};

export function blogFigurePath(kind: BlogEditorial["figure"]) {
  return `/blog/assessment-${kind}.svg`;
}
export function inferBlogFigure(text: string): BlogEditorial["figure"] {
  if (/chem|phys|chimi|data|graph|expériment/i.test(text)) return "data";
  if (/mark|corrig|rubric|standard|barème/i.test(text)) return "marking";
  return "blueprint";
}
