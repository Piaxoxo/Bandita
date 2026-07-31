import type { Metadata } from "next";
import Link from "next/link";
import { i18n, isLocale, type Locale } from "@/i18n/config";
import { OFFICE_EMAIL } from "@/lib/contact";

// Privacy policy — plain-language GDPR disclosure for what this site actually
// does: newsletter (double opt-in via FormSubmit), contact/offer forms
// (FormSubmit), Vercel hosting/server logs, outbound social links.
// Notably: NO analytics, NO tracking cookies — stated explicitly.

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "Datenschutzerklärung — Bandita",
  robots: { index: false, follow: true },
};

const OWNER = "Pia-Alice Stelzl";
const ADDRESS = "Königseggasse 5/6, 1060 Wien, Österreich";

const CONTENT: Record<Locale, { title: string; sub: string; sections: { h: string; p: string[] }[]; back: string }> = {
  de: {
    title: "Datenschutz.",
    sub: "Was mit deinen Daten passiert — kurz, ehrlich, ohne Juristendeutsch, wo es geht.",
    sections: [
      {
        h: "Verantwortliche",
        p: [`${OWNER}, ${ADDRESS}`, `E-Mail: ${OFFICE_EMAIL}`],
      },
      {
        h: "Keine Cookies, keine Wiedererkennung",
        p: [
          "Diese Website setzt keine Cookies und arbeitet ohne Werbe- oder Profiling-Tracker. Deshalb gibt es hier auch kein Cookie-Banner.",
          "Zur Reichweitenmessung nutzen wir Vercel Web Analytics. Dieses Tool arbeitet cookielos und ohne Cross-Site-Tracking: Es speichert keine personenbezogenen Profile und erstellt aus technischen Angaben (z. B. Seitenaufruf, Referrer, grober Standort auf Länderebene, Gerätetyp) lediglich anonyme Statistiken. Ein Rückschluss auf einzelne Personen ist nicht möglich (Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse an einer funktionierenden Website).",
          "Links zu unseren Social-Media-Profilen enthalten UTM-Parameter; die werten die jeweiligen Plattformen aus, nicht wir.",
        ],
      },
      {
        h: "Newsletter — Der Bandit Letter",
        p: [
          "Wenn du dich anmeldest, verwenden wir deine E-Mail-Adresse ausschließlich für den Versand des Newsletters (ca. einmal im Monat). Rechtsgrundlage: deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du mit dem Absenden des Formulars erteilst.",
          "Die Anmeldung läuft per Double-Opt-in: Du bekommst eine Bestätigungs-Mail und bist erst nach Klick auf den Link angemeldet. Abmelden geht jederzeit mit einem Klick oder formlos per Mail — dann löschen wir deine Adresse.",
        ],
      },
      {
        h: "Kontakt- & Angebotsformulare",
        p: [
          "Was du in unsere Formulare einträgst (z. B. Firma, Ziele, Wunschleistungen, Kontaktdaten), verwenden wir nur zur Bearbeitung deiner Anfrage (Art. 6 Abs. 1 lit. b DSGVO — vorvertragliche Maßnahmen).",
          "Die Übermittlung erfolgt über den Formulardienst FormSubmit an unser Postfach. Wir geben deine Daten nicht an Dritte weiter und löschen sie, sobald sie für die Anfrage nicht mehr gebraucht werden.",
        ],
      },
      {
        h: "Hosting & Server-Logs",
        p: [
          "Diese Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf werden technisch notwendige Daten (IP-Adresse, Zeitpunkt, abgerufene Seite, Browser) in Server-Logs verarbeitet (Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse am sicheren Betrieb).",
          "Mit Vercel besteht ein Auftragsverarbeitungsvertrag; Übermittlungen in die USA stützen sich auf EU-Standardvertragsklauseln.",
        ],
      },
      {
        h: "Deine Rechte",
        p: [
          "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Erteilte Einwilligungen kannst du jederzeit widerrufen.",
          `Schreib dafür einfach an ${OFFICE_EMAIL}. Außerdem kannst du dich bei der österreichischen Datenschutzbehörde beschweren (dsb.gv.at) — aber ehrlich: schreib zuerst uns, wir lösen das schneller.`,
        ],
      },
    ],
    back: "Zum Impressum",
  },
  en: {
    title: "Privacy.",
    sub: "What happens with your data — short and honest, with as little legalese as possible.",
    sections: [
      {
        h: "Controller",
        p: [`${OWNER}, ${ADDRESS}`, `Email: ${OFFICE_EMAIL}`],
      },
      {
        h: "No cookies, no profiling",
        p: [
          "This website sets no cookies and uses no advertising or profiling trackers. That's why there is no cookie banner.",
          "For audience measurement we use Vercel Web Analytics. It works without cookies and without cross-site tracking: it stores no personal profiles and only derives anonymous statistics from technical data (e.g. page view, referrer, coarse country-level location, device type). No conclusions about individuals are possible (Art. 6(1)(f) GDPR — legitimate interest in a functioning website).",
          "Links to our social profiles carry UTM parameters; those are evaluated by the platforms, not by us.",
        ],
      },
      {
        h: "Newsletter — The Bandit Letter",
        p: [
          "If you sign up, we use your email address solely to send the newsletter (about once a month). Legal basis: your consent (Art. 6(1)(a) GDPR), given by submitting the form.",
          "Signup uses double opt-in: you receive a confirmation email and are only subscribed after clicking the link. You can unsubscribe any time with one click or by email — we then delete your address.",
        ],
      },
      {
        h: "Contact & offer forms",
        p: [
          "Whatever you enter in our forms (e.g. company, goals, services, contact details) is used only to process your request (Art. 6(1)(b) GDPR — pre-contractual measures).",
          "Submissions are delivered to our inbox via the form service FormSubmit. We don't pass your data to third parties and delete it once it's no longer needed for the request.",
        ],
      },
      {
        h: "Hosting & server logs",
        p: [
          "This website is hosted by Vercel Inc. (USA). Technically necessary data (IP address, timestamp, page, browser) is processed in server logs (Art. 6(1)(f) GDPR — legitimate interest in secure operation).",
          "A data processing agreement is in place with Vercel; transfers to the USA rely on EU standard contractual clauses.",
        ],
      },
      {
        h: "Your rights",
        p: [
          "You have the right to access, rectification, erasure, restriction of processing, data portability and objection. You can withdraw any consent at any time.",
          `Just write to ${OFFICE_EMAIL}. You can also complain to the Austrian data protection authority (dsb.gv.at) — but honestly: write to us first, we'll fix it faster.`,
        ],
      },
    ],
    back: "Legal notice",
  },
};

export default function PrivacyPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const c = CONTENT[lang];
  return (
    <div className="relative overflow-hidden bg-creme px-5 pb-28 pt-36 text-ink md:px-10 md:pb-36">
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(45% 35% at 20% 8%, rgba(251,0,63,0.08), transparent 70%)" }} />
      <div className="relative mx-auto max-w-3xl">
        <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-pink">
          {lang === "de" ? "Rechtliches · Wien" : "Legal · Vienna"}
        </p>
        <h1 className="mt-4 font-display text-5xl font-medium tracking-[-0.02em] md:text-7xl">{c.title}</h1>
        <p className="mt-4 max-w-xl font-display text-xl italic text-ink/60 md:text-2xl">{c.sub}</p>
        {c.sections.map((s) => (
          <section key={s.h} className="mt-12">
            <h2 className="flex items-center gap-2.5 font-display text-2xl font-medium tracking-[-0.01em]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-pink" />
              {s.h}
            </h2>
            {s.p.map((t, i) => (
              <p key={i} className="mt-3 font-sans text-[15px] leading-relaxed text-ink/70">{t}</p>
            ))}
          </section>
        ))}
        <div className="mt-14 border-t border-ink/10 pt-8">
          <Link href={`/${lang}/impressum`} data-cursor="link"
            className="group inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.14em] text-pink transition-colors hover:text-ink">
            {c.back} <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
