import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { ArrowRight, Clock, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

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

const FALLBACK_ARTICLES: BlogPost[] = [
  {
    id: "seed-1",
    slug: "bac-libanais-official-alignment",
    title: "Official Alignment: How Imtihan Matches the Lebanese Decree",
    description: "Learn how our AI engine is calibrated to follow the specific verbs and cognitive levels required by the CERD and the Ministry of Education.",
    category: "Exam Techniques",
    readTime: "5 min read",
    date: "May 1, 2026"
  },
  {
    id: "seed-2",
    slug: "parental-guide-brevet-success",
    title: "The Parent's Guide to Brevet Success: No Expertise Required",
    description: "How parents can use Imtihan to generate mock sessions for their children and monitor progress without needing to know the subject matter.",
    category: "Parental Guides",
    readTime: "4 min read",
    date: "May 1, 2026"
  },
  {
    id: "seed-3",
    slug: "the-art-of-the-corrige",
    title: "Beyond the Question: The Art of the Automated Corrigé",
    description: "A deep dive into how Imtihan generates marking schemes that save hours of manual drafting for teachers.",
    category: "Productivity",
    readTime: "6 min read",
    date: "May 1, 2026"
  },
  {
    id: "seed-4",
    slug: "stop-recycled-exams",
    title: "Are Your Students Bored of the Same Recycled Exams?",
    description: "Why using past papers (Dawrat) is hurting your students' engagement, and how AI can instantly solve the problem.",
    category: "Teaching Strategies",
    readTime: "4 min read",
    date: "May 1, 2026"
  },
  {
    id: "seed-5",
    slug: "save-time-teaching",
    title: "Reclaiming Your Sundays: How Imtihan Automates Teacher Tasks",
    description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation.",
    category: "Productivity",
    readTime: "4 min read",
    date: "April 30, 2026"
  }
];

async function getArticles(category: string, page: number) {
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const snapshot = await adminDb.collection("blog_posts")
      .orderBy("createdAt", "desc")
      .get();

    let docs = snapshot.docs;

    if (docs.length > 0) {
      if (category && category !== "All") {
        docs = docs.filter((doc: any) => doc.data().category === category);
      }

      const total = docs.length;
      const totalPages = Math.ceil(total / limit);

      const articles = docs
        .slice(skip, skip + limit)
        .map((doc: any) => {
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

      return { articles, totalPages };
    }
  } catch (e) {
    console.error("Firestore error, using fallbacks:", e);
  }

  let filteredFallbacks = FALLBACK_ARTICLES;
  if (category && category !== "All") {
    filteredFallbacks = FALLBACK_ARTICLES.filter(a => a.category === category);
  }
  const totalPages = Math.ceil(filteredFallbacks.length / limit);
  const articles = filteredFallbacks.slice(skip, skip + limit);

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
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-20 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]/60">
        <Logo size={28} />
        <Link 
          href="/dashboard"
          className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors uppercase tracking-widest"
        >
          Back to App
        </Link>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-16 md:py-24">
        {/* Original Hero Style */}
        <div className="mb-16 md:mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Educational Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text)] mb-6 tracking-tight leading-[1.1]">
            The <span className="text-[var(--accent)]">Imtihan</span> Journal
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-medium">
            Strategic insights for the Lebanese educational landscape. Empowering teachers, students, and parents with AI.
          </p>
        </div>

        {/* Original Category Buttons Style */}
        <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
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

        {/* Original Articles Grid Style */}
        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/blog/${article.slug}`}
                className="group card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)]">
                      <Clock size={12} /> {article.readTime}
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text)] mb-3 leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2 h-[3.5rem]">
                    {article.title}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <span className="text-xs font-medium text-[var(--text-tertiary)]">{article.date}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                    Read article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--surface)] rounded-[32px] border border-dashed border-[var(--border)] mb-16">
            <p className="text-[var(--text-secondary)] font-medium">No articles found in this category.</p>
            <Link 
              href="/blog"
              className="mt-4 inline-block text-sm font-bold text-[var(--accent)] hover:underline"
            >
              View all articles
            </Link>
          </div>
        )}

        {/* Original Pagination UI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Link
              href={`/blog?category=${activeCategory}&page=${Math.max(1, currentPage - 1)}`}
              className={cn(
                "w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] transition-all",
                currentPage === 1 ? "opacity-30 pointer-events-none" : "hover:border-[var(--accent)] hover:text-[var(--accent)]"
              )}
            >
              <ChevronLeft size={18} />
            </Link>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <Link
                  key={pageNum}
                  href={`/blog?category=${activeCategory}&page=${pageNum}`}
                  className={cn(
                    "w-10 h-10 rounded-xl border text-sm font-medium transition-all flex items-center justify-center",
                    currentPage === pageNum
                      ? "bg-[var(--text)] text-white border-[var(--text)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  )}
                >
                  {pageNum}
                </Link>
              ))}
            </div>

            <Link
              href={`/blog?category=${activeCategory}&page=${Math.min(totalPages, currentPage + 1)}`}
              className={cn(
                "w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] transition-all",
                currentPage === totalPages ? "opacity-30 pointer-events-none" : "hover:border-[var(--accent)] hover:text-[var(--accent)]"
              )}
            >
              <ChevronRight size={18} />
            </Link>
          </div>
        )}
      </main>

      <footer className="px-10 py-10 bg-[var(--surface)] border-t border-[var(--border)] mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={24} />
          <p className="text-xs text-[var(--text-tertiary)] font-medium">
            Made for Lebanese Educators · © {new Date().getFullYear()} Imtihan
          </p>
        </div>
      </footer>
    </div>
  );
}
