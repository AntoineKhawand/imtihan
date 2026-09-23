// Single source of truth for the 9 hardcoded ("static seed") blog posts —
// the ones that live at src/app/blog/<slug>/page.tsx rather than being
// Firestore documents rendered through src/app/blog/[slug]/page.tsx.
//
// Previously this same list was hand-maintained in two places that had to be
// kept in sync by hand: STATIC_ARTICLES in src/app/blog/page.tsx (index/listing
// display) and STATIC_BLOG_SLUGS in src/app/sitemap.ts (sitemap URLs). Both
// consumers now import this one array instead, so adding/removing a static
// post only ever means editing this file.
//
// If a new static post page is added under src/app/blog/<new-slug>/page.tsx,
// add its entry here — it will then automatically appear in both the blog
// index and the sitemap.
export interface StaticBlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
}

export const STATIC_BLOG_POSTS: StaticBlogPost[] = [
  {
    slug: "stop-recycled-exams",
    title: "Are Your Students Bored of the Same Recycled Exams?",
    description: "Why using past papers (Dawrat) is hurting your students' engagement, and how AI can instantly solve the problem.",
    category: "Teaching Strategies",
    readTime: "4 min read",
    date: "May 1, 2026"
  },
  {
    slug: "save-time-teaching",
    title: "Reclaiming Your Sundays: How Imtihan Automates Teacher Tasks",
    description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation.",
    category: "Productivity",
    readTime: "4 min read",
    date: "April 30, 2026"
  },
  {
    slug: "guide-for-parents",
    title: "Is Your Child Ready for the Brevet? Mock Exams at Home",
    description: "How parents can use Imtihan to generate mock sessions for their children and monitor progress without needing to know the subject matter.",
    category: "Parental Guides",
    readTime: "4 min read",
    date: "April 29, 2026"
  },
  {
    slug: "exam-standardization",
    title: "The Coordinator's Secret: Standardizing Exam Quality",
    description: "How school coordinators can use AI to enforce consistent question quality and cognitive level distribution across all teachers.",
    category: "Exam Techniques",
    readTime: "5 min read",
    date: "April 28, 2026"
  },
  {
    slug: "university-assessment-ai",
    title: "Complex Assessments Simplified: AI for University Exams",
    description: "How university professors can leverage AI to generate multi-part, high-difficulty assessments aligned with academic standards.",
    category: "Exam Techniques",
    readTime: "6 min read",
    date: "April 27, 2026"
  },
  {
    slug: "generate-bac-libanais-chemistry",
    title: "How to generate a Bac Libanais chemistry exam in 5 minutes",
    description: "Learn how chemistry teachers in Lebanon can write comprehensive, curriculum-aligned Bac Libanais exam drafts and step-by-step correction keys using AI.",
    category: "Resources",
    readTime: "5 min read",
    date: "May 10, 2026"
  },
  {
    slug: "ib-mark-scheme-generator",
    title: "IB mark scheme generator: free tool for IB teachers",
    description: "Find out how to automatically generate detailed IB-compliant mark schemes for DP Physics and Chemistry using Imtihan's free AI tool.",
    category: "Resources",
    readTime: "5 min read",
    date: "May 9, 2026"
  },
  {
    slug: "generate-bac-francais-devoir",
    title: "Générateur de devoir Bac Français : Gagnez des heures sur vos DS",
    description: "Découvrez comment concevoir des Devoirs Surveillés (DS) de spécialité Physique-Chimie conformes au Baccalauréat Français (AEFE) en 5 minutes.",
    category: "Resources",
    readTime: "5 min read",
    date: "May 8, 2026"
  },
  {
    slug: "lebanese-teachers-ai-exam-generator",
    title: "Reclaiming Your Evenings: The Power of AI Exam Generators for Lebanese Teachers",
    description: "Explore how Lebanese educators are overcoming preparation fatigue and grading overhead using local-curriculum AI assessment tools.",
    category: "Productivity",
    readTime: "6 min read",
    date: "May 7, 2026"
  },
];
