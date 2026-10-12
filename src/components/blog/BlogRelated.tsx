import { BLOG_EDITORIAL } from "@/data/blogEditorial";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: string;
}

interface BlogRelatedProps {
  currentSlug: string;
  title?: string;
}

const ARTICLES: Article[] = [
  {
    slug: "stop-recycled-exams",
    title: BLOG_EDITORIAL["stop-recycled-exams"].title,
    category: "Teaching Strategies",
    readTime: "4 min read"
  },
  {
    slug: "save-time-teaching",
    title: BLOG_EDITORIAL["save-time-teaching"].title,
    category: "Productivity",
    readTime: "4 min read"
  },
  {
    slug: "guide-for-parents",
    title: BLOG_EDITORIAL["guide-for-parents"].title,
    category: "Parental Guides",
    readTime: "5 min read"
  },
  {
    slug: "exam-standardization",
    title: BLOG_EDITORIAL["exam-standardization"].title,
    category: "Leadership",
    readTime: "6 min read"
  },
  {
    slug: "university-assessment-ai",
    title: BLOG_EDITORIAL["university-assessment-ai"].title,
    category: "Higher Ed",
    readTime: "5 min read"
  },
  {
    slug: "generate-bac-libanais-chemistry",
    title: BLOG_EDITORIAL["generate-bac-libanais-chemistry"].title,
    category: "Resources",
    readTime: "5 min read"
  },
  {
    slug: "ib-mark-scheme-generator",
    title: BLOG_EDITORIAL["ib-mark-scheme-generator"].title,
    category: "Resources",
    readTime: "5 min read"
  },
  {
    slug: "generate-bac-francais-devoir",
    title: BLOG_EDITORIAL["generate-bac-francais-devoir"].title,
    category: "Resources",
    readTime: "5 min read"
  },
  {
    slug: "lebanese-teachers-ai-exam-generator",
    title: BLOG_EDITORIAL["lebanese-teachers-ai-exam-generator"].title,
    category: "Productivity",
    readTime: "6 min read"
  }
];

export function BlogRelated({ currentSlug, title = "" }: BlogRelatedProps) {
  const topic = `${currentSlug} ${title}`;
  const preferred = /\bib\b|mark.scheme/i.test(topic) ? ["ib-mark-scheme-generator", "exam-standardization"]
    : /chimi|chemi|phys/i.test(topic) ? ["generate-bac-libanais-chemistry", "generate-bac-francais-devoir"]
    : /parent|brevet|revision/i.test(topic) ? ["guide-for-parents", "stop-recycled-exams"]
    : /univers|entrance/i.test(topic) ? ["university-assessment-ai", "ib-mark-scheme-generator"]
    : /standard|coordinat|diagnostic/i.test(topic) ? ["exam-standardization", "stop-recycled-exams"]
    : ["save-time-teaching", "lebanese-teachers-ai-exam-generator"];
  const ranked = [...preferred, ...ARTICLES.map(article => article.slug)];
  const related = [...ARTICLES].filter(article => article.slug !== currentSlug)
    .sort((a, b) => ranked.indexOf(a.slug) - ranked.indexOf(b.slug)).slice(0, 2);

  return (
    <div className="py-2">
      <h3 className="serif text-2xl text-[var(--text)] mb-8">Continue Reading</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        {related.map((article) => (
          <Link 
            key={article.slug} 
            href={`/blog/${article.slug}`}
            className="group card p-7 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 ring-1 ring-black/[0.02]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] uppercase tracking-widest font-black text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md border border-[var(--accent)]/10">
                  {article.category}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)]">
                  <Clock size={14} /> {article.readTime}
                </div>
              </div>
              <h4 className="serif text-lg font-bold text-[var(--text)] mb-4 leading-snug group-hover:text-[var(--accent)] transition-colors">
                {article.title}
              </h4>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] mt-4">
              Read article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
