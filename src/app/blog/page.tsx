"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CATEGORIES = ["All", "Teaching Strategies", "Productivity", "Parental Guides", "Leadership", "Higher Ed"];

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const res = await fetch(`/api/blog?category=${activeCategory}&page=${currentPage}&limit=6`, {
          cache: "no-store"
        });
        const data = await res.json();
        if (data.articles) {
          setArticles(data.articles);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [activeCategory, currentPage]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-[var(--text)] transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            Try free <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <header className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-10 overflow-hidden border-b border-[var(--border)]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">Imtihan Blog</p>
          <h1 className="serif text-display-xl text-[var(--text)] leading-tight mb-4">
            Insights for the entire educational community
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-12">
            Resources for teachers, parents, coordinators, and professors.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`h-9 px-4 rounded-full text-xs font-semibold transition-all duration-300 ${
                  activeCategory === cat 
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-16 md:py-24">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
          </div>
        ) : (
          <>
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

            {/* Pagination UI */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="px-6 md:px-10 py-12 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={24} />
          <p className="text-xs text-[var(--text-tertiary)] text-center order-3 md:order-2">
            Made for Lebanese teachers · © {new Date().getFullYear()} Imtihan
          </p>
        </div>
      </footer>
    </div>
  );
}
