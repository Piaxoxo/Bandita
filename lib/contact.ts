// Central contact routing. Every form/CTA on the site funnels here so leads
// land — categorised — in one inbox.
export const OFFICE_EMAIL = "office@bandita.agency";

export type LeadCategory = "Angebot" | "Newsletter" | "Projekt" | "Rückruf" | "Kontakt";

// Build a categorised mailto link. The [Category] prefix lets the inbox filter
// and route automatically.
export function mailto(category: LeadCategory, subject: string, body = ""): string {
  const s = encodeURIComponent(`[${category}] ${subject}`);
  const b = encodeURIComponent(body);
  return `mailto:${OFFICE_EMAIL}?subject=${s}${b ? `&body=${b}` : ""}`;
}
