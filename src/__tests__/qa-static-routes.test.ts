import { expect, it } from "vitest";
import { STATIC_SITEMAP_ROUTES } from "@/lib/seo/static-sitemap-routes";

it("never advertises development QA/auth/editor pages in the public sitemap", () => {
  expect(STATIC_SITEMAP_ROUTES.some(({ path }) => path.startsWith("/test-"))).toBe(false);
  expect(STATIC_SITEMAP_ROUTES.some(({ path }) => path === "/")).toBe(true);
});
