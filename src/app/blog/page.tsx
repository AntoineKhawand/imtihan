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

    // Use Firestore articles
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

  // Use Fallbacks if Firestore is empty or fails
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
    <div className="min-h-screen bg-[#FDFDFC] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
        <Logo size={28} />
        <Link 
          href="/dashboard"
          className="text-[10px] font-black text-gray-400 hover:text-emerald-600 transition-colors uppercase tracking-[0.2em] px-4 py-2 rounded-full hover:bg-emerald-50"
        >
          Back to App
        </Link>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-20 md:py-32">
        <div className="mb-20 md:mb-32 text-center relative">
          <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full -z-10 translate-y-[-20%]" />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Curriculum Intelligence
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-8 tracking-tight leading-[0.95]">
            Insights for <span className="text-emerald-600">Educators.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Strategic resources for the Lebanese and International landscape. Elevating every classroom with AI.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-16 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/blog?category=${cat}&page=1`}
              className={cn(
                "h-12 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center justify-center",
                activeCategory === cat 
                  ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-black/10 scale-105" 
                  : "bg-white text-gray-400 border-gray-100 hover:border-emerald-600 hover:text-emerald-600"
              )}
            >
              {cat}
            </Link>
          ))}
        </div>

        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
            {articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/blog/${article.slug}`}
                className="group flex flex-col h-full bg-white rounded-[40px] border border-gray-100 overflow-hidden hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-700"
              >
                <div className="p-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      <Clock size={14} /> {article.readTime}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-black text-gray-900 mb-6 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  
                  <p className="text-[15px] text-gray-400 leading-relaxed font-medium line-clamp-3 mb-10">
                    {article.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{article.date}</span>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[60px] border border-dashed border-gray-100 mb-20">
            <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mx-auto mb-8">
              <FileText size={48} />
            </div>
            <p className="text-xl font-black text-gray-400">No content found in this category.</p>
            <Link 
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 text-xs font-black text-emerald-600 hover:gap-4 transition-all uppercase tracking-widest"
            >
              Back to Journal <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/blog?category=${activeCategory}&page=${Math.max(1, currentPage - 1)}`}
              className={cn(
                "w-14 h-14 rounded-[20px] border border-gray-100 flex items-center justify-center text-gray-400 transition-all",
                currentPage === 1 ? "opacity-20 pointer-events-none" : "hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-50"
              )}
            >
              <ChevronLeft size={24} />
            </Link>
            
            <div className="flex items-center gap-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <Link
                  key={pageNum}
                  href={`/blog?category=${activeCategory}&page=${pageNum}`}
                  className={cn(
                    "w-14 h-14 rounded-[20px] border text-xs font-black transition-all flex items-center justify-center",
                    currentPage === pageNum
                      ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-black/10 scale-110"
                      : "border-gray-100 text-gray-400 hover:border-emerald-600 hover:text-emerald-600"
                  )}
                >
                  {pageNum}
                </Link>
              ))}
            </div>

            <Link
              href={`/blog?category=${activeCategory}&page=${Math.min(totalPages, currentPage + 1)}`}
              className={cn(
                "w-14 h-14 rounded-[20px] border border-gray-100 flex items-center justify-center text-gray-400 transition-all",
                currentPage === totalPages ? "opacity-20 pointer-events-none" : "hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-50"
              )}
            >
              <ChevronRight size={24} />
            </Link>
          </div>
        )}
      </main>

      <footer className="px-10 py-32 bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="flex flex-col items-center md:items-start gap-6">
            <Logo size={28} />
            <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] max-w-xs leading-relaxed text-center md:text-left">
              Standardizing the Lebanese educational experience with proprietary AI.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[10px] text-gray-900 font-black uppercase tracking-[0.2em]">
              Imtihan Editorial Board
            </p>
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
