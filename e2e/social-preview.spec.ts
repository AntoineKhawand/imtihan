import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test("public share metadata points crawlers to the versioned, renderable social image", async ({ request, page }, testInfo) => {
  test.setTimeout(180_000);
  for (const path of ["/", "/ib-exam-generator", "/about"]) {
    const response = await request.get(path, { headers: { "user-agent": "facebookexternalhit/1.1" } });
    expect(response.status()).toBe(200);
    const metadata = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return {
        og: doc.querySelector('meta[property="og:image"]')?.getAttribute("content"),
        twitter: doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content"),
        width: doc.querySelector('meta[property="og:image:width"]')?.getAttribute("content"),
        height: doc.querySelector('meta[property="og:image:height"]')?.getAttribute("content"),
      };
    }, await response.text());
    expect(metadata.og).toBe("https://imtihan.live/opengraph-image?v=20261016");
    expect(metadata.twitter).toBe(metadata.og);
    expect(metadata.width).toBe("1200");
    expect(metadata.height).toBe("630");
  }
  // Request the real local image route; never contact production or paid providers.
  const image = await request.get("/opengraph-image?v=20261016");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
  const png = await image.body();
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
  expect(png.length).toBeLessThan(1_000_000);
  await writeFile(testInfo.outputPath("social-preview.png"), png);
  await testInfo.attach("Rendered social preview", { body: png, contentType: "image/png" });
});
