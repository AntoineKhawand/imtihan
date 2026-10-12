import type { Metadata } from "next";
import {
  BLOG_EDITORIAL,
  BLOG_REFRESH_DATE,
  blogFigurePath,
} from "@/data/blogEditorial";

export function staticBlogMetadata(slug: string): Metadata {
  const article = BLOG_EDITORIAL[slug];
  const image = {
    url: blogFigurePath(article.figure),
    width: 1200,
    height: 630,
    alt: article.title,
  };
  return {
    title: { absolute: `${article.title} | Imtihan` },
    description: article.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: `/blog/${slug}`,
      images: [image],
      publishedTime: article.published,
      modifiedTime: BLOG_REFRESH_DATE,
      locale: article.language === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [image],
    },
  };
}
