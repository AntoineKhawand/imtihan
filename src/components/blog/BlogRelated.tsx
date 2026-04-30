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
    <div className="py-16 border-t border-[var(--border)]">
      <h3 className="serif text-2xl text-[var(--text)] mb-8">You might also like</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        {related.map((article) => (
          <Link 
            key={article.slug} 
            href={`/blog/${article.slug}`}
            className="group card p-6 bg-[var(--surface)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded-md">
                {article.category}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-tertiary)]">
                <Clock size={12} /> {article.readTime}
              </div>
            </div>
            <h4 className="text-base font-semibold text-[var(--text)] mb-4 leading-snug group-hover:text-[var(--accent)] transition-colors">
              {article.title}
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)]">
              Read article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
