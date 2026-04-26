import type { ExamContext } from "@/types/exam";

const COUNTRY_CODES: Record<string, string> = {
  "lebanon": "LB",
  "france": "FR",
  "united states": "US",
  "usa": "US",
  "united kingdom": "GB",
  "uk": "GB",
  "germany": "DE",
  "canada": "CA",
  "australia": "AU",
  "japan": "JP",
  "china": "CN",
  "brazil": "BR",
  "india": "IN",
  "italy": "IT",
  "spain": "ES",
  "switzerland": "CH",
  "belgium": "BE",
  "netherlands": "NL",
  "turkey": "TR",
  "saudi arabia": "SA",
  "uae": "AE",
  "egypt": "EG",
  "jordan": "JO",
  "syria": "SY",
  "iraq": "IQ",
};

const INDICATORS = [
  { id: "NY.GDP.MKTP.CD", name: "GDP (Current USD)" },
  { id: "FP.CPI.TOTL.ZG", name: "Inflation (Consumer Prices %)" },
  { id: "SL.UEM.TOTL.ZS", name: "Unemployment Total (% of total labor force)" },
  { id: "SI.POV.GINI", name: "Gini Index (Inequality)" },
  { id: "SP.POP.TOTL", name: "Population Total" },
];

import { GEOGRAPHIC_SUBJECTS } from "@/data/curricula";

/**
 * Silent data injection for Humanities subjects (Economics, SES, Geography, Sociology, etc.).
 * Fetches real-world figures from World Bank and REST Countries.
 */
export async function getHumanitiesContext(context: ExamContext): Promise<string | undefined> {
  if (!GEOGRAPHIC_SUBJECTS.includes(context.subject as any)) return undefined;

  const country = (context.geographicContext || "Global").toLowerCase();
  const code = COUNTRY_CODES[country];

  if (!code || code === "Global") {
    return `Note: No specific geographic data found for "${context.geographicContext}". Use general textbook figures or global averages.`;
  }

  try {
    const [wbData, countryData] = await Promise.all([
      fetchWorldBankData(code),
      fetchRESTCountryData(code),
    ]);

    let output = `REAL-WORLD DATA CONTEXT FOR ${country.toUpperCase()} (Source: World Bank & REST Countries):\n`;
    
    if (countryData) {
      output += `- Region: ${countryData.region}\n`;
      output += `- Subregion: ${countryData.subregion}\n`;
      output += `- Capital: ${countryData.capital}\n`;
      output += `- Area: ${countryData.area.toLocaleString()} km²\n`;
    }

    if (wbData && wbData.length > 0) {
      wbData.forEach((item: any) => {
        if (item.value !== null) {
          output += `- ${item.indicatorName}: ${item.value.toLocaleString()} (${item.year})\n`;
        }
      });
    }

    return output;
  } catch (err) {
    console.warn("[humanities] Failed to fetch humanities data:", err);
    return undefined;
  }
}

async function fetchWorldBankData(countryCode: string) {
  // Fetch the last 3 years to ensure we get a value (some indicators have lag)
  const fetchPromises = INDICATORS.map(async (ind) => {
    try {
      const res = await fetch(
        `https://api.worldbank.org/v2/country/${countryCode}/indicator/${ind.id}?format=json&date=2021:2023`,
        { next: { revalidate: 86400 } } // Cache for 24h
      );
      const data = await res.json();
      if (Array.isArray(data) && data[1]) {
        // Find the first non-null value
        const latest = data[1].find((d: any) => d.value !== null);
        if (latest) {
          return {
            indicatorName: ind.name,
            value: latest.value,
            year: latest.date,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(fetchPromises);
  return results.filter(Boolean);
}

async function fetchRESTCountryData(countryCode: string) {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`, {
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      const c = data[0];
      return {
        region: c.region,
        subregion: c.subregion,
        capital: c.capital?.[0],
        area: c.area,
        population: c.population,
      };
    }
    return null;
  } catch {
    return null;
  }
}
