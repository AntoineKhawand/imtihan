import { BLOG_REFRESH_DATE } from "@/data/blogEditorial";

export function BlogArticleDates({
  published,
  french = false,
}: {
  published: string;
  french?: boolean;
}) {
  const format = (date: string) =>
    new Date(date).toLocaleDateString(french ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return (
    <p className="mb-6 flex flex-wrap gap-x-5 gap-y-1 text-xs leading-relaxed text-[var(--text-secondary)]">
      <span>
        {french ? "Publié le " : "Published "}
        <time dateTime={published}>{format(published)}</time>
      </span>
      <span>
        {french ? "Mis à jour le " : "Updated "}
        <time dateTime={BLOG_REFRESH_DATE}>{format(BLOG_REFRESH_DATE)}</time>
      </span>
    </p>
  );
}
