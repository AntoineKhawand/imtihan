import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterSubscribers } from "@/components/admin/NewsletterSubscribers";
import { NewsletterPreview } from "@/components/admin/NewsletterPreview";
import { buildNewsletterHtml } from "@/lib/emails/newsletter";

let root: Root | undefined;
let container: HTMLDivElement;
async function mount(element: React.ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root!.render(element));
}
afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  container?.remove();
});

describe("newsletter redesign", () => {
  it("escapes recipient text and preserves separate campaign attribution", () => {
    const html = buildNewsletterHtml(
      '<img src=x onerror="alert(1)">',
      "October",
      "https://imtihan.live",
      "admin_outreach",
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.querySelector("[onerror]")).toBeNull();
    expect(doc.body.textContent).toContain('<img src=x onerror="alert(1)">');
    const cta = new URL(doc.querySelector<HTMLAnchorElement>("a.cta")!.href);
    expect(cta.searchParams.get("utm_campaign")).toBe("admin_outreach");
    expect(cta.searchParams.get("utm_medium")).toBe("email");
    const scheduled = new DOMParser().parseFromString(
      buildNewsletterHtml("Alex", "October"),
      "text/html",
    );
    expect(
      new URL(
        scheduled.querySelector<HTMLAnchorElement>("a.cta")!.href,
      ).searchParams.get("utm_campaign"),
    ).toBe("weekly_newsletter");
  });

  it("filters the subscriber directory and retries only when clicked", async () => {
    const resend = vi.fn();
    await mount(
      <NewsletterSubscribers
        subscribers={[
          {
            id: "1",
            email: "teacher@example.com",
            source: "footer",
            createdAt: 1,
            checklistSentAt: 10,
          },
          {
            id: "2",
            email: "pending@example.com",
            source: "blog",
            createdAt: 1,
            checklistSentAt: null,
          },
        ]}
        loading={false}
        resending={false}
        onResend={resend}
      />,
    );
    const status = container.querySelector<HTMLSelectElement>("select")!;
    await act(async () => {
      status.value = "pending";
      status.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(
      container.querySelector("[aria-label='Subscriber directory']")!
        .textContent,
    ).not.toContain("teacher@example.com");
    expect(container.querySelector("[role='status']")!.textContent).toBe(
      "1 of 2 shown",
    );
    const search = container.querySelector<HTMLInputElement>(
      'input[type="search"]',
    )!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(search, "unmatched");
      search.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(container.textContent).toContain("No matching subscribers");
    expect(resend).not.toHaveBeenCalled();
    await act(async () =>
      container.querySelector<HTMLButtonElement>("button")!.click(),
    );
    expect(resend).toHaveBeenCalledOnce();
  });

  it("provides a sandboxed preview and switches phone/desktop widths", async () => {
    await mount(<NewsletterPreview />);
    const frame = container.querySelector("iframe")!;
    expect(frame.getAttribute("sandbox")).toBe("");
    expect(frame.style.width).toBe("375px");
    await act(async () => container.querySelectorAll("button")[1].click());
    expect(frame.style.width).toBe("640px");
    expect(
      container.querySelectorAll("button")[1].getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
