import Link from "next/link";
import { BLOG_EDITORIAL } from "@/data/blogEditorial";

export function BlogPracticalExample({ slug }: { slug: string }) {
  const article = BLOG_EDITORIAL[slug];
  if (!article) return null;
  const french = article.language === "fr";
  return (
    <section
      className="not-prose my-12 space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8"
      aria-labelledby="practical-example"
    >
      <h2 id="practical-example" className="serif text-2xl text-[var(--text)]">
        {french
          ? "Un exemple à adapter à votre classe"
          : "A practical example for your classroom"}
      </h2>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {french
          ? "Adaptez cette consigne à votre niveau et aux chapitres réellement enseignés :"
          : "Adapt this teacher brief to your level and the chapters actually taught:"}
      </p>
      <blockquote className="m-0 border-l-2 border-[var(--accent)] pl-4 text-base leading-relaxed text-[var(--text)]">
        {article.prompt}
      </blockquote>
      <h3 className="font-semibold text-[var(--text)]">
        {french
          ? "Avant de distribuer le sujet"
          : "Before giving the paper to students"}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {article.review}
      </p>
      <Link
        href="/create"
        className="inline-block text-sm font-semibold text-[var(--accent)] underline underline-offset-4"
      >
        {french
          ? "Créer un sujet à vérifier"
          : "Create an exam draft to review"}
      </Link>
    </section>
  );
}
