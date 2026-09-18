/**
 * BlogFAQ — in-article FAQ block for blog posts (GEO/AEO signal).
 *
 * Renders visible, directly-quotable Q&A copy inside the <article> element
 * (so it counts toward word count and heading structure, not just JSON-LD)
 * for AI answer engines to lift a concise answer from. Pair with
 * `buildFaqSchema` from `@/components/landing/LandingFAQ` and `<SchemaOrg>`
 * to also emit FAQPage structured data — the visible copy and the JSON-LD
 * `q`/`a` text should match verbatim, not just approximate each other.
 *
 * Usage:
 *   const FAQ_ITEMS = [{ q: "...", a: "..." }, ...];
 *   <SchemaOrg schema={[articleSchema, buildFaqSchema(FAQ_ITEMS)]} />
 *   ...
 *   <article>
 *     ...
 *     <BlogFAQ items={FAQ_ITEMS} />
 *   </article>
 */

export type BlogFaqItem = { q: string; a: string };

export function BlogFAQ({ items }: { items: BlogFaqItem[] }) {
  return (
    <section aria-label="Frequently asked questions" className="mt-14 not-prose">
      <h2 className="text-2xl font-bold text-[var(--text)] mt-12 mb-6 serif">
        Frequently Asked Questions
      </h2>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.q}>
            <h3 className="text-base font-bold text-[var(--text)] mb-1.5">{item.q}</h3>
            <p className="text-[var(--text-secondary)] text-[0.95rem] leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
