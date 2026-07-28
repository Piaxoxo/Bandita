// Central contact routing. Every form/CTA on the site funnels here so leads
// land — categorised — in one inbox (office@bandita.agency).
export const OFFICE_EMAIL = "office@bandita.agency";

// ── Silent submission (no mail window on the customer's device) ─────────────
// Web3Forms delivers the form straight to the office inbox via a background
// fetch — the visitor just sees a success message, no mail app opens.
// Get a free key in ~20s: https://web3forms.com  → enter office@bandita.agency
// → the access key is emailed to that inbox → paste it below.
export const WEB3FORMS_ACCESS_KEY = ""; // ← paste the Web3Forms access key here

export type LeadCategory = "Angebot" | "Newsletter" | "Projekt" | "Rückruf" | "Kontakt";

export type LeadResult = "sent" | "notconfigured" | "error";

// Send a lead silently. Returns "notconfigured" if no key is set yet (callers
// then fall back to mailto so nothing is ever lost).
export async function sendLead(fields: {
  category: LeadCategory;
  subject: string;
  message: string;
  name?: string;
  email?: string;
  phone?: string;
}): Promise<LeadResult> {
  if (!WEB3FORMS_ACCESS_KEY) return "notconfigured";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `[${fields.category}] ${fields.subject}`,
        from_name: fields.name || fields.email || "Bandita Website",
        replyto: fields.email || "",
        phone: fields.phone || "",
        message: fields.message,
      }),
    });
    const data = await res.json();
    return data?.success ? "sent" : "error";
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
