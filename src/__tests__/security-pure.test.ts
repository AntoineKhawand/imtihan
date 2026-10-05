import { describe, it, expect } from "vitest";
import {
  sanitizeFilename,
  sanitizePath,
  InputSchema,
  validateInput,
  isValidUrl,
  isValidEmail,
  isValidIp,
  defaultSecurityConfig,
  createSecurityHeaders,
  sanitizeError,
} from "@/lib/security";

// ---------------------------------------------------------------------------
// src/lib/security.ts had zero test coverage before this file (confirmed via
// `npm run test:coverage` baseline on 2026-10-05 — 0% of this file exercised).
// Every export here is a pure, synchronous, dependency-free (beyond `zod`)
// function/constant — no firebase-admin, no network, no Firestore — so the
// whole module is testable directly, unlike the Firestore-backed helpers in
// `teacherStyle.ts`/`rateLimit.ts` that are intentionally left untested at
// the unit level per those files' own test comments.
//
// Note: `createSecurityHeaders` and `sanitizeError` are the only two exports
// actually wired into live API routes today (every handler listed by
// `grep -rl "from \"@/lib/security\"" src/app/api` imports one or both of
// them for its response headers / error responses). `sanitizeFilename`,
// `sanitizePath`, `isValidUrl`, `isValidEmail`, `isValidIp`, `InputSchema`,
// and `defaultSecurityConfig` are exported but currently unused anywhere in
// the app (confirmed via grep) — still worth covering now so a regression
// is caught the day one of them gets wired up, same rationale BUGS.md gives
// for leaving the *used* dead-code removal pass (2026-09-27, removal of
// `sanitizeHTML`/`sanitizeObject`) narrowly scoped rather than also deleting
// these.
// ---------------------------------------------------------------------------

describe("sanitizeFilename", () => {
  it("keeps alphanumeric characters, dots, hyphens, and underscores", () => {
    expect(sanitizeFilename("exam_bac-libanais.v2.docx")).toBe("exam_bac-libanais.v2.docx");
  });

  it("strips path separators, spaces, and special characters", () => {
    expect(sanitizeFilename("../../etc/passwd; rm -rf")).toBe("....etcpasswdrm-rf");
  });

  it("strips unicode characters outside the ASCII allowlist (e.g. Arabic exam titles)", () => {
    expect(sanitizeFilename("امتحان رياضيات.docx")).toBe(".docx");
  });

  it("truncates to 255 characters", () => {
    const long = "a".repeat(300);
    const result = sanitizeFilename(long);
    expect(result).toHaveLength(255);
  });

  it("returns an empty string for an empty input", () => {
    expect(sanitizeFilename("")).toBe("");
  });
});

describe("sanitizePath", () => {
  it("keeps a normal nested path untouched", () => {
    expect(sanitizePath("users/123/exams/final-v2.pdf")).toBe("users/123/exams/final-v2.pdf");
  });

  it("strips every '..' token so parent-directory traversal segments are removed", () => {
    expect(sanitizePath("../../etc/passwd")).toBe("//etc/passwd");
    expect(sanitizePath("../../etc/passwd")).not.toContain("..");
  });

  it("strips disallowed characters such as angle brackets or query-string tokens", () => {
    expect(sanitizePath("users/123/exam<script>.pdf")).toBe("users/123/examscript.pdf");
    expect(sanitizePath("file.pdf?token=abc&x=1")).toBe("file.pdftokenabcx1");
  });

  it("returns an empty string for an empty input", () => {
    expect(sanitizePath("")).toBe("");
  });
});

describe("InputSchema + validateInput", () => {
  it("accepts a fully-populated, well-formed payload", () => {
    const payload = {
      description: "Chapter 3 exam on derivatives",
      curriculumId: "bac-libanais",
      levelId: "terminale-s",
      subject: "mathematics",
      chapterIds: ["derivatives", "limits"],
      language: "french",
      examType: "final",
      pointsTotal: 20,
      difficultyEasy: 30,
      difficultyMedium: 50,
      difficultyHard: 20,
      exerciseCount: 5,
      format: "word",
      includeAnswerKey: true,
      temperature: 0.7,
      maxTokens: 8000,
    };
    expect(validateInput(InputSchema, payload)).toEqual(payload);
  });

  it("accepts an empty object — every field is optional", () => {
    expect(validateInput(InputSchema, {})).toEqual({});
  });

  it("returns null (not a throw) for an invalid enum value", () => {
    expect(validateInput(InputSchema, { language: "arabic-dialect" })).toBeNull();
  });

  it("returns null when exerciseCount is out of range", () => {
    expect(validateInput(InputSchema, { exerciseCount: 0 })).toBeNull();
    expect(validateInput(InputSchema, { exerciseCount: 21 })).toBeNull();
  });

  it("returns null when more than 20 chapterIds are supplied", () => {
    const chapterIds = Array.from({ length: 21 }, (_, i) => `ch-${i}`);
    expect(validateInput(InputSchema, { chapterIds })).toBeNull();
  });

  it("returns null when description exceeds the 10,000-character cap", () => {
    expect(validateInput(InputSchema, { description: "x".repeat(10001) })).toBeNull();
  });

  it("returns null for a completely malformed payload (e.g. a string, not an object)", () => {
    expect(validateInput(InputSchema, "not-an-object")).toBeNull();
    expect(validateInput(InputSchema, null)).toBeNull();
    expect(validateInput(InputSchema, undefined)).toBeNull();
  });

  it("returns null when a numeric field is sent as a string (no implicit coercion)", () => {
    expect(validateInput(InputSchema, { exerciseCount: "5" })).toBeNull();
  });
});

describe("isValidUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isValidUrl("https://imtihan.live")).toBe(true);
    expect(isValidUrl("http://example.com/path?x=1")).toBe(true);
  });

  it("rejects non-http(s) protocols (e.g. javascript: or file:)", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("file:///etc/passwd")).toBe(false);
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });

  it("rejects strings that are not valid URLs at all", () => {
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed emails", () => {
    expect(isValidEmail("teacher@school.edu.lb")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.domain.com")).toBe(true);
  });

  it("rejects strings missing '@' or a domain", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing-domain@")).toBe(false);
    expect(isValidEmail("@missing-local.com")).toBe(false);
  });

  it("rejects emails containing whitespace", () => {
    expect(isValidEmail("has space@example.com")).toBe(false);
  });
});

describe("isValidIp", () => {
  it("accepts a well-formed dotted-quad IPv4 address", () => {
    expect(isValidIp("192.168.1.1")).toBe(true);
    expect(isValidIp("8.8.8.8")).toBe(true);
  });

  it("accepts a fully-expanded (8-group) IPv6 address", () => {
    expect(isValidIp("2001:0db8:0000:0000:0000:8a2e:0370:7334")).toBe(true);
  });

  it("rejects an obviously malformed string", () => {
    expect(isValidIp("not-an-ip")).toBe(false);
    expect(isValidIp("")).toBe(false);
  });

  // ---------------------------------------------------------------------
  // Known gaps — documented here, NOT fixed (CLAUDE.md §15: never modify
  // application code just to make a test pass; this module isn't currently
  // wired to anything live — see file header — so severity is low, but the
  // function is unsafe for its stated purpose if it's ever wired up, e.g.
  // to validate rateLimit.ts's `getClientIp()` output before trusting it).
  // ---------------------------------------------------------------------
  it("[KNOWN GAP] rejects standard compressed/shorthand IPv6 addresses (e.g. '::1', '::')", () => {
    // Real-world IPv6 addresses almost always use "::" shorthand — the
    // regex only accepts the fully-expanded 8-group form, so this function
    // would reject the vast majority of real IPv6 traffic if it were ever
    // used to validate a live request's address.
    expect(isValidIp("::1")).toBe(false); // loopback — should arguably be true
    expect(isValidIp("2001:db8::8a2e:370:7334")).toBe(false); // common shorthand form
  });

  it("[KNOWN GAP] accepts out-of-range IPv4 octets (no 0–255 bound checking)", () => {
    // ipv4Regex is `(\d{1,3}\.){3}\d{1,3}` — any 1-3 digit group passes,
    // so a clearly invalid address like 999.999.999.999 is reported valid.
    expect(isValidIp("999.999.999.999")).toBe(true); // should arguably be false
  });
});

describe("defaultSecurityConfig", () => {
  it("defines a sane 5MB request-size cap and the two content types the app actually accepts", () => {
    expect(defaultSecurityConfig.maxRequestSize).toBe(5 * 1024 * 1024);
    expect(defaultSecurityConfig.allowedContentTypes).toEqual(
      expect.arrayContaining(["application/json", "multipart/form-data"])
    );
  });

  it("includes the production apex/www domains in corsOrigins", () => {
    expect(defaultSecurityConfig.corsOrigins).toContain("https://imtihan.live");
    expect(defaultSecurityConfig.corsOrigins).toContain("https://www.imtihan.live");
  });
});

describe("createSecurityHeaders", () => {
  const headers = createSecurityHeaders();

  it("sets the standard clickjacking/MIME-sniffing/referrer hardening headers", () => {
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=31536000");
  });

  it("disables camera/microphone/geolocation/payment via Permissions-Policy", () => {
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Permissions-Policy"]).toContain("microphone=()");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
    expect(headers["Permissions-Policy"]).toContain("payment=()");
  });

  // Regression test for BUG-014 (CSP `script-src` blocked Google
  // Analytics/GTM — see BUGS.md). The fix touched both `src/proxy.ts` (the
  // CSP actually enforced on page navigations) and this function (kept
  // consistent "to avoid the same trap resurfacing if it's ever applied to
  // page responses" per the fix's own rationale). This locks that in.
  it("[regression: BUG-014] allows Google Tag Manager/Analytics in its CSP", () => {
    const csp = headers["Content-Security-Policy"];
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("https://www.google-analytics.com");
    expect(csp).toContain("https://*.google-analytics.com");
    expect(csp).toContain("https://*.analytics.google.com");
  });

  it("restricts default-src and frame-src to 'self' plus Firebase auth popups", () => {
    const csp = headers["Content-Security-Policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-src 'self' https://*.firebaseapp.com");
  });

  it("returns a fresh object on each call (no shared mutable state)", () => {
    const a = createSecurityHeaders();
    const b = createSecurityHeaders();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});

describe("sanitizeError", () => {
  it("returns a generic message for a real Error, never the original message", () => {
    const err = new Error("Firestore permission denied for users/abc123/exams/secret-doc");
    const result = sanitizeError(err);
    expect(result).toBe("An error occurred. Please try again.");
    expect(result).not.toContain("Firestore");
    expect(result).not.toContain("abc123");
  });

  it("returns a generic message for a non-Error thrown value (string, object, etc.)", () => {
    expect(sanitizeError("raw string throw")).toBe("An unexpected error occurred.");
    expect(sanitizeError({ code: "ECONNREFUSED" })).toBe("An unexpected error occurred.");
    expect(sanitizeError(undefined)).toBe("An unexpected error occurred.");
    expect(sanitizeError(null)).toBe("An unexpected error occurred.");
  });

  it("still returns the generic Error message even for subclasses (e.g. TypeError)", () => {
    expect(sanitizeError(new TypeError("boom"))).toBe("An error occurred. Please try again.");
  });
});
