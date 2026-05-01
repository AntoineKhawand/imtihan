import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Calendar, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { adminDb } from "@/lib/firebase-admin";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { BlogProgressBar } from "@/components/blog/BlogProgressBar";
import { BlogAuthor } from "@/components/blog/BlogAuthor";
import { BlogRelated } from "@/components/blog/BlogRelated";
import { BlogShare } from "@/components/blog/BlogShare";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const snapshot = await adminDb.collection("blog_posts")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    date: data.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }) || "Recently"
  };
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) return { title: "Article Not Found | Imtihan" };

  return {
    title: `${post.title} | Imtihan Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://imtihan.live/blog/${slug}`,
    }
  };
}

export default async function DynamicBlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const url = `https://imtihan.live/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <BlogProgressBar />
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[var(--bg)]/75 backdrop-blur-xl border-b border-[var(--border)]/60 transition-colors">
        <Logo size={26} />
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            Try Imtihan <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_320px] gap-12 px-6 md:px-10 py-16 md:py-24">
        <main>
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-md">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)]">
              <Clock size={14} /> {post.readTime}
            </div>
          </div>

          <h1 className="serif text-display-lg text-[var(--text)] leading-[1.1] mb-8 text-balance">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 mb-12 py-6 border-y border-[var(--border)]/60">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Calendar size={16} className="text-[var(--accent)]" />
              {post.date}
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <User size={16} className="text-[var(--accent)]" />
              By {post.author || "Imtihan Editor"}
            </div>
          </div>

          <article className="prose prose-imtihan max-w-none text-[var(--text)] text-[1.1rem] leading-relaxed mb-16">
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-4 serif" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-[var(--text)] mt-8 mb-3 serif" {...props} />,
                p: ({node, ...props}) => <p className="mb-6" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
                li: ({node, ...props}) => <li {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>

          <BlogAuthor 
            name="Imtihan AI"
            role="Educational Strategy Assistant"
            avatarText="IA"
            bio="Our autonomous AI editor researches current trends in the Lebanese curriculum to provide teachers and parents with the most relevant insights and productivity tips."
          />
          
          <BlogRelated currentSlug={post.slug} />
        </main>

        <aside className="hidden lg:flex flex-col gap-10 sticky top-24 self-start">
          <div className="card p-6 bg-[var(--surface)]">
            <h4 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wider">Share Article</h4>
            <BlogShare title={post.title} url={url} />
          </div>
          
          <div className="card p-6 bg-[var(--accent-light)] border-[var(--accent)]/10">
            <h4 className="text-base font-bold text-[var(--accent)] mb-2 serif">Level Up Your Exams</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Join 1,000+ Lebanese teachers using AI to create professional assessments in minutes.
            </p>
            <Link href="/create" className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-[var(--accent)] text-white font-bold hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>

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
