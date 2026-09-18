import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

describe("next.config redirects — www to apex canonicalization", () => {
  it("redirects www.imtihan.live to imtihan.live permanently", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toBeDefined();

    const wwwRedirect = redirects?.find((r) =>
      r.has?.some((h) => h.type === "host" && h.value === "www.imtihan.live")
    );

    expect(wwwRedirect).toBeDefined();
    expect(wwwRedirect?.destination).toBe("https://imtihan.live/:path*");
    expect(wwwRedirect?.permanent).toBe(true);
  });
});
