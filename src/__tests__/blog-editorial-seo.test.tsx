import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BLOG_EDITORIAL, blogFigurePath } from "@/data/blogEditorial";
import {
  blogDateIso,
  buildBlogArticleSchema,
  buildBlogBreadcrumbSchema,
} from "@/lib/blogSchema";
import { staticBlogMetadata } from "@/lib/blogMetadata";
import { SchemaOrg } from "@/components/SchemaOrg";
import { BlogArticleFigure } from "@/components/blog/BlogArticleFigure";
import { BlogPracticalExample } from "@/components/blog/BlogPracticalExample";
import { existsSync } from "node:fs";

describe("existing blog editorial SEO", () => {
  it("keeps metadata, canonical URL and visible headline aligned for all nine articles", () => {
    expect(Object.keys(BLOG_EDITORIAL)).toHaveLength(9);
    for (const [slug, article] of Object.entries(BLOG_EDITORIAL)) {
      const metadata = staticBlogMetadata(slug);
      expect(metadata.title).toEqual({
        absolute: `${article.title} | Imtihan`,
      });
      expect(metadata.description).toBe(article.description);
      expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
      expect(article.description.length).toBeLessThanOrEqual(165);
      expect(article.title.length).toBeLessThanOrEqual(65);
      expect(existsSync(`public${blogFigurePath(article.figure)}`)).toBe(true);
    }
  });
  it("uses original publication dates and genuine modification dates in article markup", () => {
    const article = buildBlogArticleSchema({
      slug: "example",
      title: "A guide",
      description: "Useful context",
      published: { toDate: () => new Date("2026-05-01T10:00:00Z") },
      modified: new Date("2026-10-12T08:00:00Z"),
    });
    expect(article.datePublished).toBe("2026-05-01T10:00:00.000Z");
    expect(article.dateModified).toBe("2026-10-12T08:00:00.000Z");
    expect(article.mainEntityOfPage["@id"]).toBe(
      "https://imtihan.live/blog/example",
    );
    expect(article.publisher.logo.url).toBe(
      "https://imtihan.live/Imtihan-logo.png",
    );
    expect(article.image[0]).toContain("/blog/assessment-");
  });
  it("omits unavailable dates instead of inventing today's publication date", () => {
    for (const value of [
      undefined,
      null,
      "not a date",
      {
        toDate: () => {
          throw new Error("invalid timestamp");
        },
      },
    ])
      expect(blogDateIso(value)).toBeUndefined();
    expect(
      buildBlogArticleSchema({
        slug: "example",
        title: "Title",
        description: "Description",
      }),
    ).not.toHaveProperty("datePublished");
  });
  it("provides real breadcrumb destinations and visible responsive figures", () => {
    expect(
      buildBlogBreadcrumbSchema("example", "Title").itemListElement.map(
        (item) => item.item,
      ),
    ).toEqual([
      "https://imtihan.live",
      "https://imtihan.live/blog",
      "https://imtihan.live/blog/example",
    ]);
    const html = renderToStaticMarkup(<BlogArticleFigure kind="marking" />);
    expect(html).toContain('width="1200"');
    expect(html).toContain("Illustrative marking example");
    expect(html).toContain("figcaption");
    expect(
      renderToStaticMarkup(
        <BlogPracticalExample slug="ib-mark-scheme-generator" />,
      ),
    ).toContain("current IB subject guide");
  });
  it("prevents authored text from breaking out of a JSON-LD script", () => {
    const html = renderToStaticMarkup(
      <SchemaOrg
        schema={{ headline: '</script><script>alert("x")</script>' }}
      />,
    );
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html).toContain("\\u003c/script>");
    const payload = html.slice(
      html.indexOf(">") + 1,
      html.lastIndexOf("</script>"),
    );
    expect(JSON.parse(payload).headline).toBe(
      '</script><script>alert("x")</script>',
    );
  });
});
