// ─────────────────────────────────────────────────────────────────────────────
// Central marketing config — social channels, newsletter & promo.
// Edit HERE only; every section on the site reads from this file.
// ─────────────────────────────────────────────────────────────────────────────

export type SocialChannel = {
  key: string;
  name: string;
  handle: string;
  url: string; // ⚠️ PLACEHOLDER URLs — replace with the real profiles before launch
  color: string; // platform brand colour (hover glow / gradient border)
};

export const SOCIAL_LINKS: SocialChannel[] = [
  // Echte Profile (Stand Juli 2026):
  { key: "instagram", name: "Instagram", handle: "@bandita.agency", url: "https://www.instagram.com/bandita.agency/", color: "#E4405F" },
  { key: "facebook", name: "Facebook", handle: "Bandita Agency", url: "https://www.facebook.com/profile.php?id=61592501850907", color: "#1877F2" },
  { key: "linkedin", name: "LinkedIn", handle: "Bandita Studio", url: "https://www.linkedin.com/company/bandita-studio/", color: "#0A66C2" },
];

export const INSTAGRAM = SOCIAL_LINKS[0];

export const NEWSLETTER_NAME = "Der Bandit Letter";
// Abo-Bonus: KEIN Rabatt — ein Gratis-Strategiecall (30 Min). Der Buchungs-
// Link wird NACH der Double-Opt-in-Bestätigung per Willkommens-Mail verschickt.
export const PROMO_BONUS = {
  de: "ein 30-Minuten-Strategiecall. Gratis. Unverbindlich. Ehrlich.",
  en: "a 30-minute strategy call. Free. Non-binding. Honest.",
};
export const PROMO_BADGE = {
  de: "Bandit-Letter-Abonnenten bekommen einen Gratis-Strategiecall dazu.",
  en: "Bandit Letter subscribers get a free strategy call on top.",
};

// Attach UTM parameters so we can see in analytics which placement converts.
export function utm(url: string, medium: string, campaign = "bandita_site"): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=website&utm_medium=${medium}&utm_campaign=${campaign}`;
}
