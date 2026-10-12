import { blogFigurePath, inferBlogFigure } from "@/data/blogEditorial";

export function blogDateIso(value: unknown): string | undefined {
  if (value == null) return undefined;
  try {
    const date =
      typeof value === "object" &&
      "toDate" in value &&
      typeof value.toDate === "function"
        ? value.toDate()
        : value instanceof Date
          ? value
          : typeof value === "string" || typeof value === "number"
            ? new Date(value)
            : null;
    return date instanceof Date && !Number.isNaN(date.getTime())
      ? date.toISOString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function buildBlogArticleSchema(input: {
  slug: string;
  title: string;
  description: string;
  author?: string;
  published?: unknown;
  modified?: unknown;
  language?: string;
  image?: string;
}) {
  const url = `https://imtihan.live/blog/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.title,
    description: input.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: [
      `https://imtihan.live${input.image ?? blogFigurePath(inferBlogFigure(input.title))}`,
    ],
    ...(blogDateIso(input.published)
      ? { datePublished: blogDateIso(input.published) }
      : {}),
    ...(blogDateIso(input.modified)
      ? { dateModified: blogDateIso(input.modified) }
      : {}),
    ...(input.language
      ? {
          inLanguage:
            input.language === "French"
              ? "fr"
              : input.language === "English"
                ? "en"
                : input.language,
        }
      : {}),
    author: {
      "@type": "Organization",
      name: input.author || "Imtihan Editorial Team",
      url: "https://imtihan.live/about",
    },
    publisher: {
      "@type": "Organization",
      name: "Imtihan",
      logo: {
        "@type": "ImageObject",
        url: "https://imtihan.live/Imtihan-logo.png",
      },
    },
    isAccessibleForFree: true,
  };
}

export function buildBlogBreadcrumbSchema(slug: string, title: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://imtihan.live",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://imtihan.live/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `https://imtihan.live/blog/${slug}`,
      },
    ],
  };
}
