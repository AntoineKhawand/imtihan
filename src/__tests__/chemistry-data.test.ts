// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FALLBACK_ELEMENTS,
  getAllElements,
  getElementBySymbol,
  formatElementsForPrompt,
  type ChemicalElement,
} from "@/lib/chemistry";

// ---------------------------------------------------------------------------
// src/lib/chemistry.ts is wired into /api/generate (used whenever
// context.subject is "chemistry" or "physique-chimie" — src/app/api/generate/
// route.ts:14,358-363) but had zero test coverage before this file. The
// network-calling functions (getAllElements/getElementBySymbol) are covered
// here via a mocked `fetch` (vi.stubGlobal, same pattern as
// openai-provider.test.ts) — never a live network call — so the module's
// most important real-world property, that it degrades to FALLBACK_ELEMENTS
// rather than ever breaking exam generation when the third-party
// ChemistryDataAPI is slow/down/malformed, is actually exercised.
// ---------------------------------------------------------------------------

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FALLBACK_ELEMENTS", () => {
  it("has a non-empty list of well-formed elements with unique symbols", () => {
    expect(FALLBACK_ELEMENTS.length).toBeGreaterThan(0);
    const symbols = FALLBACK_ELEMENTS.map((e) => e.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
    for (const el of FALLBACK_ELEMENTS) {
      expect(el.name).toBeTruthy();
      expect(el.symbol).toBeTruthy();
      expect(el.atomicNumber).toBeGreaterThan(0);
    }
  });
});

describe("getAllElements", () => {
  it("returns the parsed array when the API responds with ok + an array body", async () => {
    const apiElements: ChemicalElement[] = [
      { name: "Lithium", symbol: "Li", atomicNumber: 3, atomicMass: 6.94, category: "alkali metal", group: 1, period: 2, phase: "Solid", summary: "Lithium." },
    ];
    fetchMock.mockResolvedValue({ ok: true, json: async () => apiElements });

    const result = await getAllElements();

    expect(result).toEqual(apiElements);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://chemistrydata.herokuapp.com/all");
  });

  it("falls back to FALLBACK_ELEMENTS when the API responds ok but the body is not an array", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ unexpected: "shape" }) });

    const result = await getAllElements();

    expect(result).toEqual(FALLBACK_ELEMENTS);
  });

  it("falls back to FALLBACK_ELEMENTS when the API responds with a non-ok status", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => [] });

    const result = await getAllElements();

    expect(result).toEqual(FALLBACK_ELEMENTS);
  });

  it("falls back to FALLBACK_ELEMENTS rather than throwing when fetch rejects (network down/timeout)", async () => {
    fetchMock.mockRejectedValue(new Error("network unreachable"));

    const result = await getAllElements();

    expect(result).toEqual(FALLBACK_ELEMENTS);
  });

  it("falls back to FALLBACK_ELEMENTS when the response body is malformed JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });

    const result = await getAllElements();

    expect(result).toEqual(FALLBACK_ELEMENTS);
  });
});

describe("getElementBySymbol", () => {
  beforeEach(() => {
    // Exercise the real fallback path deterministically, without depending
    // on getAllElements' own fetch behavior (covered separately above).
    fetchMock.mockRejectedValue(new Error("network unreachable"));
  });

  it("finds an element by exact-case symbol", async () => {
    const result = await getElementBySymbol("Fe");
    expect(result?.name).toBe("Iron");
  });

  it("matches case-insensitively", async () => {
    const lower = await getElementBySymbol("fe");
    const upper = await getElementBySymbol("FE");
    expect(lower?.name).toBe("Iron");
    expect(upper?.name).toBe("Iron");
  });

  it("returns null for a symbol that isn't in the element list", async () => {
    const result = await getElementBySymbol("Zz");
    expect(result).toBeNull();
  });
});

describe("formatElementsForPrompt", () => {
  it("returns an empty string for an empty element list", () => {
    expect(formatElementsForPrompt([])).toBe("");
  });

  it("formats a single element as 'Name (Symbol): Atomic # N, Mass M'", () => {
    const result = formatElementsForPrompt([FALLBACK_ELEMENTS[0]]);
    expect(result).toBe("Hydrogen (H): Atomic # 1, Mass 1.008");
  });

  it("joins multiple elements with newlines, preserving input order", () => {
    const result = formatElementsForPrompt(FALLBACK_ELEMENTS.slice(0, 3));
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("Hydrogen");
    expect(lines[1]).toContain("Helium");
    expect(lines[2]).toContain("Carbon");
  });

  it("handles a string atomicMass value (as returned by the real API for some elements)", () => {
    const el: ChemicalElement = {
      name: "Technetium", symbol: "Tc", atomicNumber: 43, atomicMass: "[98]",
      category: "transition metal", group: 7, period: 5, phase: "Solid", summary: "Synthetic.",
    };
    expect(formatElementsForPrompt([el])).toBe("Technetium (Tc): Atomic # 43, Mass [98]");
  });
});
