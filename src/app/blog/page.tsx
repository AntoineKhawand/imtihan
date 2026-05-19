import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { ArrowRight, Clock, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
}

const CATEGORIES = ["All", "Teaching Strategies", "Exam Techniques", "Productivity", "Resources", "Parental Guides"];

// Static articles that always appear in the index (hardcoded pages under /blog/*)
const STATIC_ARTICLES: BlogPost[] = [
  {
    id: "static-1",
    slug: "stop-recycled-exams",
    title: "Are Your Students Bored of the Same Recycled Exams?",
    description: "Why using past papers (Dawrat) is hurting your students' engagement, and how AI can instantly solve the problem.",
    category: "Teaching Strategies",
    readTime: "4 min read",
    date: "May 1, 2026"
  },
  {
    id: "static-2",
    slug: "save-time-teaching",
    title: "Reclaiming Your Sundays: How Imtihan Automates Teacher Tasks",
    description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation.",
    category: "Productivity",
    readTime: "4 min read",
    date: "April 30, 2026"
  },
  {
    id: "static-3",
    slug: "guide-for-parents",
    title: "Is Your Child Ready for the Brevet? Mock Exams at Home",
    description: "How parents can use Imtihan to generate mock sessions for their children and monitor progress without needing to know the subject matter.",
    category: "Parental Guides",
    readTime: "4 min read",
    date: "April 29, 2026"
  },
  {
    id: "static-4",
    slug: "exam-standardization",
    title: "The Coordinator's Secret: Standardizing Exam Quality",
    description: "How school coordinators can use AI to enforce consistent question quality and cognitive level distribution across all teachers.",
    category: "Exam Techniques",
    readTime: "5 min read",
    date: "April 28, 2026"
  },
  {
    id: "static-5",
    slug: "university-assessment-ai",
    title: "Complex Assessments Simplified: AI for University Exams",
    description: "How university professors can leverage AI to generate multi-part, high-difficulty assessments aligned with academic standards.",
    category: "Exam Techniques",
    readTime: "6 min read",
    date: "April 27, 2026"
  },
  {
    id: "static-6",
    slug: "generate-bac-libanais-chemistry",
    title: "How to generate a Bac Libanais chemistry exam in 5 minutes",
    description: "Learn how chemistry teachers in Lebanon can write comprehensive, curriculum-aligned Bac Libanais exam drafts and step-by-step correction keys using AI.",
    category: "Resources",
    readTime: "5 min read",
    date: "May 10, 2026"
  },
  {
    id: "static-7",
    slug: "ib-mark-scheme-generator",
    title: "IB mark scheme generator: free tool for IB teachers",
    description: "Find out how to automatically generate detailed IB-compliant mark schemes for DP Physics and Chemistry using Imtihan's free AI tool.",
    category: "Resources",
    readTime: "5 min read",
    date: "May 9, 2026"
  },
  {
    id: "static-8",
    slug: "generate-bac-francais-devoir",
    title: "Générateur de devoir Bac Français : Gagnez des heures sur vos DS",
    description: "Découvrez comment concevoir des Devoirs Surveillés (DS) de spécialité Physique-Chimie conformes au Baccalauréat Français (AEFE) en 5 minutes.",
    category: "Resources",
    readTime: "5 min read",
    date: "May 8, 2026"
  },
  {
    id: "static-9",
    slug: "lebanese-teachers-ai-exam-generator",
    title: "Reclaiming Your Evenings: The Power of AI Exam Generators for Lebanese Teachers",
    description: "Explore how Lebanese educators are overcoming preparation fatigue and grading overhead using local-curriculum AI assessment tools.",
    category: "Productivity",
    readTime: "6 min read",
    date: "May 7, 2026"
  },
];

const FALLBACK_ARTICLES: BlogPost[] = STATIC_ARTICLES;

async function getArticles(category: string, page: number) {
  const limit = 6;
  const skip = (page - 1) * limit;

  let firestoreDocs: BlogPost[] = [];

  try {
    const snapshot = await adminDb.collection("blog_posts")
      .orderBy("createdAt", "desc")
      .get();

    firestoreDocs = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      let displayDate = "Recently";
      if (data.createdAt) {
        displayDate = typeof data.createdAt.toDate === "function"
          ? data.createdAt.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      }
      return {
        id: doc.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        category: data.category,
        readTime: data.readTime,
        date: displayDate
      };
    });
  } catch (e) {
    console.error("Firestore error, using static articles only:", e);
  }

  // Merge: Firestore first, then static articles not already present
  const firestoreSlugs = new Set(firestoreDocs.map(a => a.slug));
  const merged = [
    ...firestoreDocs,
    ...STATIC_ARTICLES.filter(a => !firestoreSlugs.has(a.slug)),
  ];

  let filtered = merged;
  if (category && category !== "All") {
    filtered = merged.filter(a => a.category === category);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const articles = filtered.slice(skip, skip + limit);

  return { articles, totalPages };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const currentPage = parseInt(params.page || "1");

  const { articles, totalPages } = await getArticles(activeCategory, currentPage);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]/60">
        <Logo size={26} />
        <Link 
          href="/"
          className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors uppercase tracking-widest"
        >
          Back Home
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-24 px-6 md:px-10 overflow-hidden border-b border-[var(--border)]/60 mesh-gradient">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.035] blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest mb-8 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Educational Intelligence
          </div>
          
          <h1 className="serif text-display-xl text-[var(--text)] mb-6 tracking-tight leading-[1.1]">
            The <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-emerald-400">Imtihan</span> Journal
          </h1>
          
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-medium text-pretty">
            Strategic insights for the Lebanese educational landscape. Empowering teachers, students, and parents with AI-driven pedagogy.
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12">
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 mb-16 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/blog?category=${cat}&page=1`}
              className={cn(
                "h-10 px-6 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center justify-center",
                activeCategory === cat 
                  ? "bg-[var(--text)] text-white border-[var(--text)] shadow-lg shadow-black/5" 
                  : "bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-secondary)]"
              )}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/blog/${article.slug}`}
                className="group card p-7 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 ring-1 ring-black/[0.02]"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[9px] uppercase tracking-widest font-black text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md border border-[var(--accent)]/10">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-tertiary)]">
                      <Clock size={14} /> {article.readTime}
                    </div>
                  </div>
                  <h2 className="serif text-xl font-bold text-[var(--text)] mb-4 leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2 h-[3.5rem]">
                    {article.title}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-6">
                    {article.description}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{article.date}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)]">
                    Read article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[var(--bg-subtle)] rounded-[40px] border border-dashed border-[var(--border)] mb-16">
            <p className="text-[var(--text-secondary)] font-medium">No articles found in this category.</p>
            <Link 
              href="/blog"
              className="mt-4 inline-block text-sm font-bold text-[var(--accent)] hover:underline"
            >
              View all articles
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <Link
              href={`/blog?category=${activeCategory}&page=${Math.max(1, currentPage - 1)}`}
              className={cn(
                "w-11 h-11 rounded-2xl border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] transition-all bg-white",
                currentPage === 1 ? "opacity-30 pointer-events-none" : "hover:border-[var(--accent)] hover:text-[var(--accent)] shadow-sm"
              )}
            >
              <ChevronLeft size={20} />
            </Link>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <Link
                  key={pageNum}
                  href={`/blog?category=${activeCategory}&page=${pageNum}`}
                  className={cn(
                    "w-11 h-11 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center",
                    currentPage === pageNum
                      ? "bg-[var(--text)] text-white border-[var(--text)] shadow-lg shadow-black/10"
                      : "bg-white border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] shadow-sm"
                  )}
                >
                  {pageNum}
                </Link>
              ))}
            </div>

            <Link
              href={`/blog?category=${activeCategory}&page=${Math.min(totalPages, currentPage + 1)}`}
              className={cn(
                "w-11 h-11 rounded-2xl border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] transition-all bg-white",
                currentPage === totalPages ? "opacity-30 pointer-events-none" : "hover:border-[var(--accent)] hover:text-[var(--accent)] shadow-sm"
              )}
            >
              <ChevronRight size={20} />
            </Link>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
