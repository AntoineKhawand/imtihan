// Shared types for `blog_posts` Firestore documents.
// Field shape matches src/app/blog/[slug]/page.tsx's `BlogPost` interface and
// the documents written by src/app/api/cron/blog-auto-publish/route.ts and
// src/app/api/admin/blog/seed/route.ts.

import { z } from "zod";

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  published: boolean;
  createdAt: number | null; // epoch millis, or null if missing/unparsable
}

export interface BlogPostDetail extends BlogPostSummary {
  description: string;
  content: string;
  readTime: string;
  author: string;
}

// Editable fields for the admin PATCH endpoint. Intentionally excludes
// `slug`, `author`, `readTime`, `published`, `createdAt` — this is a scoped
// edit path (title/description/content/category only), not a full CMS.
export const BlogPostUpdateSchema = z
  .object({
    title: z.string().trim().min(1, "Title can't be empty").max(300).optional(),
    description: z.string().trim().min(1, "Description can't be empty").max(1000).optional(),
    content: z.string().trim().min(1, "Content can't be empty").optional(),
    category: z.string().trim().min(1, "Category can't be empty").max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type BlogPostUpdateInput = z.infer<typeof BlogPostUpdateSchema>;
