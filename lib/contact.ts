// Central contact routing. Every form/CTA on the site funnels here so leads
// land — categorised — in one inbox (office@bandita.agency).
export const OFFICE_EMAIL = "office@bandita.agency";

// ── Silent submission (no mail window on the customer's device) ─────────────
// FormSubmit delivers the form straight to the office inbox via a background
// fetch — the visitor just sees a success message, no mail app opens.
// No API key needed: the FIRST submission triggers a one-time activation mail
// to office@bandita.agency — click its confirm link once and it's live.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${OFFICE_EMAIL}`;

export type LeadCategory = "Angebot" | "Newsletter" | "Projekt" | "Rückruf" | "Kontakt";

export type LeadResult = "sent" | "notconfigured" | "error";

// Send a lead silently in the background. Callers fall back to mailto on
// "error"/"notconfigured" so nothing is ever lost.
export async function sendLead(fields: {
  category: LeadCategory;
  subject: string;
  message: string;
  name?: string;
  email?: string;
  phone?: string;
}): Promise<LeadResult> {
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `[${fields.category}] ${fields.subject}`,
        _template: "box",
        _captcha: "false",
        Kategorie: fields.category,
        Name: fields.name || "—",
        email: fields.email || "",
        Telefon: fields.phone || "—",
        Nachricht: fields.message,
      }),
    });
    const data = await res.json().catch(() => null);
    return res.ok && data && (data.success === "true" || data.success === true) ? "sent" : "error";
  } catch {
    return "error";
  }
}

// Build a categorised mailto link (fallback / explicit email links).
export function mailto(category: LeadCategory, subject: string, body = ""): string {
  const s = encodeURIComponent(`[${category}] ${subject}`);
  const b = encodeURIComponent(body);
  return `mailto:${OFFICE_EMAIL}?subject=${s}${b ? `&body=${b}` : ""}`;
}
