/**
 * LandingFAQ — reusable AEO (Answer Engine Optimization) block for marketing
 * landing pages. Renders visible, directly-quotable Q&A copy (so AI answer
 * engines like Google AI Overviews, Perplexity, and ChatGPT search can lift
 * a concise answer straight from the page) alongside FAQPage JSON-LD via
 * `buildFaqSchema`, which the page should merge into its <SchemaOrg> array.
 *
 * Usage:
 *   const FAQ_ITEMS = [{ q: "...", a: "..." }, ...];
 *   <SchemaOrg schema={[pageSchema, buildFaqSchema(FAQ_ITEMS)]} />
 *   ...
 *   <LandingFAQ items={FAQ_ITEMS} />
 */

export type FaqItem = { q: string; a: string };

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function LandingFAQ({
  items,
  title = "Everything you need to know",
  eyebrow = "Frequently Asked Questions",
}: {
  items: FaqItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="px-6 md:px-10 py-20 border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-medium mb-4">{eyebrow}</p>
          <h2 className="serif text-display-md text-[var(--text)]">{title}</h2>
        </div>

        <div className="space-y-6">
          {items.map((item, i) => (
            <div key={i} className="card p-6 bg-[var(--surface)] hover:shadow-md transition-shadow">
              <h3 className="text-[var(--text)] font-semibold mb-2">{item.q}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
