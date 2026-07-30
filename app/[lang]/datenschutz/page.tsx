import type { Metadata } from "next";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { OFFICE_EMAIL } from "@/lib/contact";

// ⚠️ PLACEHOLDER privacy policy — the structure is real, the legal copy MUST
// be reviewed/replaced by a lawyer before this page is linked publicly beyond
// the newsletter checkbox. noindex until then.

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "Datenschutzerklärung — Bandita",
  robots: { index: false, follow: false },
};

const CONTENT: Record<Locale, { title: string; intro: string; sections: { h: string; p: string }[] }> = {
  de: {
    title: "Datenschutzerklärung",
    intro:
      "Hier steht, was mit deinen Daten passiert — kurz, ehrlich, ohne Juristendeutsch, wo es geht. (Hinweis: Diese Seite ist ein Entwurf und wird derzeit rechtlich finalisiert.)",
    sections: [
      { h: "Verantwortlich", p: `Bandita Marketing Agency, Wien, Österreich. Kontakt: ${OFFICE_EMAIL}` },
      { h: "Newsletter (Der Bandit Letter)", p: "Deine E-Mail-Adresse verwenden wir ausschließlich für den Versand des Newsletters (ca. einmal im Monat). Die Anmeldung läuft per Double-Opt-in: Du bekommst eine Bestätigungs-Mail und bist erst nach Klick auf den Bestätigungslink angemeldet. Du kannst dich jederzeit mit einem Klick abmelden — dann löschen wir deine Adresse aus dem Verteiler." },
      { h: "Kontakt- & Angebotsformulare", p: "Was du in unsere Formulare einträgst (z. B. Firma, Ziele, Kontaktdaten), verwenden wir nur zur Bearbeitung deiner Anfrage. Die Übermittlung erfolgt über unseren Formulardienstleister an unser Postfach. Wir geben deine Daten nicht weiter." },
      { h: "Hosting & Server-Logs", p: "Diese Website wird bei Vercel gehostet. Beim Aufruf werden technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt) in Server-Logs verarbeitet." },
      { h: "Deine Rechte", p: "Du hast das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch. Schreib uns einfach: " + OFFICE_EMAIL },
    ],
  },
  en: {
    title: "Privacy Policy",
    intro:
      "What happens with your data — short and honest. (Note: this page is a draft and is currently being finalised legally.)",
    sections: [
      { h: "Controller", p: `Bandita Marketing Agency, Vienna, Austria. Contact: ${OFFICE_EMAIL}` },
      { h: "Newsletter (The Bandit Letter)", p: "We use your email address solely to send the newsletter (about once a month). Signup uses double opt-in: you receive a confirmation email and are only subscribed after clicking the link. You can unsubscribe any time with one click — we then remove your address." },
      { h: "Contact & offer forms", p: "Whatever you enter in our forms (e.g. company, goals, contact details) is used only to process your request. Submissions are delivered to our inbox via our form provider. We do not pass your data on." },
      { h: "Hosting & server logs", p: "This website is hosted on Vercel. Technically necessary data (e.g. IP address, timestamp) is processed in server logs." },
      { h: "Your rights", p: "You have the right to access, rectification, deletion and objection. Just write to us: " + OFFICE_EMAIL },
    ],
  },
};

export default function PrivacyPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const c = CONTENT[lang];
  return (
    <div className="bg-creme px-5 pb-32 pt-36 text-ink md:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-medium tracking-[-0.02em] md:text-6xl">{c.title}</h1>
        <p className="mt-6 font-sans text-base leading-relaxed text-ink/70">{c.intro}</p>
        {c.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em]">{s.h}</h2>
            <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink/70">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
