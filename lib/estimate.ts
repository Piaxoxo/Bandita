import { PRICING } from "@/components/services/services-data";

/*
  Turns a selection of services into an honest starting figure.

  Two rules decide everything here:

  1. No invented numbers. The figure is assembled from the cheapest real entry
     in our own price list for each selected service — nothing is modelled,
     estimated or marked up. If the list has no entry for a service, it says
     so instead of guessing.

  2. One-off and monthly never mix. Silently adding a €690/month retainer to a
     one-off production budget produces a number that means nothing. They are
     carried and shown separately.

  What comes out is a floor ("from"), not a quote. Every individual offer stays
  price-on-request, which is the agency's actual policy.
*/

export type Estimate = {
  /** Cheapest real one-off entries, summed. 0 when nothing matched. */
  oneOff: number;
  /** Cheapest real monthly entries, summed. 0 when nothing matched. */
  monthly: number;
  /** Services we have a list price for, with the tier that produced it. */
  covered: { service: string; tier: string; price: number; recurring: boolean }[];
  /** Selected services with no entry in the price list — on request. */
  onRequest: string[];
};

// offer-builder service key → the tag the price list uses for it
const SERVICE_TO_TAG: Record<string, string> = {
  ai: "aicontent",
  web: "web",
  social: "social",
  film: "film",
  seo: "seo",
  fullservice: "premium",
};

/*
  Price strings in the list are human text: "249 €", "ab 1.490 €", "690 €/mo".
  German thousands separators are dots, so the dot must be stripped before
  parsing or 1.490 becomes 1.49.
*/
export function parsePrice(raw: string): { value: number; recurring: boolean } | null {
  const recurring = /\/\s*mo|\/\s*Monat|p\.?m\.?/i.test(raw);
  const digits = raw.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(/,/g, ".");
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) && value > 0 ? { value, recurring } : null;
}

export function estimate(serviceKeys: string[]): Estimate {
  const covered: Estimate["covered"] = [];
  const onRequest: string[] = [];

  for (const key of serviceKeys) {
    // "Not sure yet" is a mood, not a line item.
    if (key === "unsure") continue;

    const tag = SERVICE_TO_TAG[key];
    const tiers = tag ? PRICING.tiers.filter((t) => t.tags.includes(tag)) : [];

    let best: { tier: string; price: number; recurring: boolean } | null = null;
    for (const t of tiers) {
      const p = parsePrice(t.price);
      if (!p) continue;
      if (!best || p.value < best.price) best = { tier: t.name, price: p.value, recurring: p.recurring };
    }

    if (best) covered.push({ service: key, ...best });
    else onRequest.push(key);
  }

  return {
    oneOff: covered.filter((c) => !c.recurring).reduce((s, c) => s + c.price, 0),
    monthly: covered.filter((c) => c.recurring).reduce((s, c) => s + c.price, 0),
    covered,
    onRequest,
  };
}

export const money = (n: number, lang: "de" | "en") =>
  new Intl.NumberFormat(lang === "de" ? "de-AT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
