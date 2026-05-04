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
}

const ARTICLES: Article[] = [
  {
    slug: "stop-recycled-exams",
    title: "Are Your Students Bored of the Same Recycled Exams?",
    category: "Teaching Strategies",
    readTime: "4 min read"
  },
  {
    slug: "save-time-teaching",
    title: "Reclaiming Your Sundays: 5 Ways Imtihan Automates Tasks",
    category: "Productivity",
    readTime: "4 min read"
  },
  {
    slug: "guide-for-parents",
    title: "Is Your Child Ready for the Brevet? Mock Exams at Home",
    category: "Parental Guides",
    readTime: "5 min read"
  },
  {
    slug: "exam-standardization",
    title: "The Coordinator’s Secret: Standardizing Exam Quality",
    category: "Leadership",
    readTime: "6 min read"
  },
  {
    slug: "university-assessment-ai",
    title: "Complex Assessments Simplified: AI for University Exams",
    category: "Higher Ed",
    readTime: "5 min read"
  }
];

export function BlogRelated({ currentSlug }: BlogRelatedProps) {
  const related = ARTICLES.filter(a => a.slug !== currentSlug).slice(0, 2);

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
