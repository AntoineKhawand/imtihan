import { afterEach, expect, it, vi } from "vitest";
import { STATIC_SITEMAP_ROUTES } from "@/lib/seo/static-sitemap-routes";
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("QA fixture not found"); } }));
import AdminEmailTestPage from "@/app/test-exam-regressions/admin-email/page";
afterEach(() => vi.unstubAllEnvs());

it("never advertises development QA/auth/editor pages in the public sitemap", () => {
  expect(STATIC_SITEMAP_ROUTES.some(({ path }) => path.startsWith("/test-"))).toBe(false);
  expect(STATIC_SITEMAP_ROUTES.some(({ path }) => path === "/")).toBe(true);
});

it("never exposes the admin email component fixture in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(() => AdminEmailTestPage()).toThrow("QA fixture not found");
});
