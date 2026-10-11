import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { emailCampaignUrl } from "@/lib/campaigns";
import { proxy } from "@/proxy";
import { CHECKLIST_HTML } from "@/lib/emails/newsletterChecklist";
describe("email campaign attribution", () => {
  it("preserves destinations, query values and fragments while adding stable tags", () => {
    const url = new URL(
      emailCampaignUrl(
        "https://imtihan.live/create?subject=physics#chapters",
        "welcome",
      ),
    );
    expect(url.pathname).toBe("/create");
    expect(url.hash).toBe("#chapters");
    expect(url.searchParams.get("subject")).toBe("physics");
    expect(url.searchParams.get("utm_campaign")).toBe("welcome");
    expect(url.searchParams.get("utm_medium")).toBe("email");
  });
  it("retains UTM attribution on the first, unauthenticated login page view", () => {
    const response = proxy(
      new NextRequest(
        "https://imtihan.live/create?utm_source=school_outreach&utm_medium=email&utm_campaign=schools_2026_10&unrelated=secret",
      ),
    );
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/auth/login");
    expect(location.searchParams.get("utm_source")).toBe("school_outreach");
    expect(location.searchParams.get("utm_campaign")).toBe("schools_2026_10");
    expect(location.searchParams.has("unrelated")).toBe(false);
    expect(response.cookies.get("__redirect")?.value).toBe("/create");
  });
  it("does not redirect authenticated generator visits", () => {
    const request = new NextRequest(
      "https://imtihan.live/create?utm_source=school_outreach",
      { headers: { cookie: "__session=test-session" } },
    );
    expect(proxy(request).headers.get("location")).toBeNull();
  });
  it("tags the shared checklist CTA without tracking the logo image", () => {
    expect(CHECKLIST_HTML).toContain("utm_campaign=exam_checklist");
    expect(CHECKLIST_HTML).toContain(
      'src="https://imtihan.live/Imtihan-logo.png"',
    );
  });
});
