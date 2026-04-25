/**
 * Chemistry Data Service
 * Integrates with ChemistryDataAPI and provides fallback for periodic table data.
 */

export interface ChemicalElement {
  name: string;
  symbol: string;
  atomicNumber: number;
  atomicMass: string | number;
  category: string;
  group: number;
  period: number;
  phase: string;
  summary: string;
}

const BASE_URL = "https://chemistrydata.herokuapp.com";

/**
 * Fallback data for common elements to ensure reliability
 */
export const FALLBACK_ELEMENTS: ChemicalElement[] = [
  { name: "Hydrogen", symbol: "H", atomicNumber: 1, atomicMass: 1.008, category: "diatomic nonmetal", group: 1, period: 1, phase: "Gas", summary: "Hydrogen is a chemical element with symbol H and atomic number 1." },
  { name: "Helium", symbol: "He", atomicNumber: 2, atomicMass: 4.0026, category: "noble gas", group: 18, period: 1, phase: "Gas", summary: "Helium is a chemical element with symbol He and atomic number 2." },
  { name: "Carbon", symbol: "C", atomicNumber: 6, atomicMass: 12.011, category: "polyatomic nonmetal", group: 14, period: 2, phase: "Solid", summary: "Carbon is a chemical element with symbol C and atomic number 6." },
  { name: "Nitrogen", symbol: "N", atomicNumber: 7, atomicMass: 14.007, category: "diatomic nonmetal", group: 15, period: 2, phase: "Gas", summary: "Nitrogen is a chemical element with symbol N and atomic number 7." },
  { name: "Oxygen", symbol: "O", atomicNumber: 8, atomicMass: 15.999, category: "diatomic nonmetal", group: 16, period: 2, phase: "Gas", summary: "Oxygen is a chemical element with symbol O and atomic number 8." },
  { name: "Iron", symbol: "Fe", atomicNumber: 26, atomicMass: 55.845, category: "transition metal", group: 8, period: 4, phase: "Solid", summary: "Iron is a chemical element with symbol Fe and atomic number 26." },
  { name: "Copper", symbol: "Cu", atomicNumber: 29, atomicMass: 63.546, category: "transition metal", group: 11, period: 4, phase: "Solid", summary: "Copper is a chemical element with symbol Cu and atomic number 29." },
  { name: "Gold", symbol: "Au", atomicNumber: 79, atomicMass: 196.97, category: "transition metal", group: 11, period: 6, phase: "Solid", summary: "Gold is a chemical element with symbol Au and atomic number 79." },
];

/**
 * Fetches all elements from the ChemistryDataAPI
 */
export async function getAllElements(): Promise<ChemicalElement[]> {
  try {
    const res = await fetch(`${BASE_URL}/all`, { 
      next: { revalidate: 86400 }, // Cache for 24 hours
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : FALLBACK_ELEMENTS;
    }
  } catch (error) {
    console.warn("ChemistryDataAPI unreachable, using fallback data", error);
  }
  return FALLBACK_ELEMENTS;
}

/**
 * Gets a specific element by symbol
 */
export async function getElementBySymbol(symbol: string): Promise<ChemicalElement | null> {
  const elements = await getAllElements();
  return elements.find(e => e.symbol.toLowerCase() === symbol.toLowerCase()) || null;
}

/**
 * Formats element data for AI prompt inclusion
 */
export function formatElementsForPrompt(elements: ChemicalElement[]): string {
  return elements.map(e => `${e.name} (${e.symbol}): Atomic # ${e.atomicNumber}, Mass ${e.atomicMass}`).join("\n");
}
