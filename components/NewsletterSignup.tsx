"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { mailto, sendLead } from "@/lib/contact";
import { NEWSLETTER_NAME } from "@/lib/social";

// "Der Bandit Letter" opt-in. GDPR consent checkbox, double-opt-in hint,
// honeypot against bots. Routes a categorised [Newsletter] lead to the office
// inbox in the background (no mail window); the promo code is sent manually
// AFTER the confirmation mail (double opt-in), never shown here.
export default function NewsletterSignup({ lang, tone = "dark" }: { lang: Locale; tone?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [consentErr, setConsentErr] = useState(false);
  const [honey, setHoney] = useState(""); // honeypot — humans never see it
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const de = lang === "de";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (honey.trim()) { setDone(true); return; } // bot: pretend success, send nothing
    if (!consent) { setConsentErr(true); return; }
    setConsentErr(false);
    setBusy(true);
    const res = await sendLead({
      category: "Newsletter",
      subject: email,
      message: [
        `${de ? "Newsletter-Anmeldung" : "Newsletter signup"} (${NEWSLETTER_NAME}): ${email}`,
        `${de ? "Einwilligung (DSGVO): erteilt" : "Consent (GDPR): given"}`,
        `→ ${de ? "Nach Bestätigung (Double-Opt-in) Willkommens-Mail mit dem Buchungslink für den Gratis-Strategiecall (30 Min) senden." : "After confirmation (double opt-in), send the welcome mail with the booking link for the free 30-min strategy call."}`,
      ].join("\n"),
      email,
    });
    setBusy(false);
    if (res !== "sent") {
      // background delivery unavailable → prefilled mail so the lead survives
      window.location.href = mailto(
        "Newsletter",
        de ? "Newsletter-Anmeldung" : "Newsletter signup",
        `${de ? "Bitte für den Bandit Letter anmelden" : "Please sign me up for the Bandit Letter"}: ${email}`,
      );
    }
    setDone(true);
  };

  const dark = tone === "dark";
  const border = dark ? "border-creme/25" : "border-ink/20";
  const text = dark ? "text-creme placeholder:text-creme/40" : "text-ink placeholder:text-ink/40";
  const small = dark ? "text-creme/60" : "text-ink/55";
  const btn = dark ? "bg-pink text-creme hover:bg-creme hover:text-ink" : "bg-ink text-creme hover:bg-pink";

  if (done) {
    return (
      <p className={`font-sans text-sm ${dark ? "text-creme/80" : "text-ink/70"}`}>
        {de
          ? "Fast Bandit! Bestätige kurz per Mail — dann schicken wir dir deinen Call-Link. 🖤"
          : "Almost a Bandit! Confirm via email — then we'll send your call link. 🖤"}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={de ? "Deine E-Mail" : "Your email"}
          aria-label={de ? "E-Mail für den Bandit Letter" : "Email for the Bandit Letter"}
          className={`flex-1 rounded-full border ${border} bg-transparent px-5 py-3 font-sans text-sm ${text} outline-none transition-colors focus:border-pink focus-visible:ring-2 focus-visible:ring-pink/50`}
        />
        {/* honeypot — visually hidden, tab-skipped; bots fill it, humans don't */}
        <input
          type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)}
          tabIndex={-1} autoComplete="off" aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <button type="submit" disabled={busy} data-cursor="hover"
          className={`whitespace-nowrap rounded-full px-6 py-3 font-sans text-xs uppercase tracking-[0.14em] transition-colors focus-visible:ring-2 focus-visible:ring-pink/60 disabled:opacity-60 ${btn}`}>
          {busy ? "…" : de ? "Bandit werden" : "Become a Bandit"}
        </button>
      </div>

      {/* GDPR consent + double-opt-in note */}
      <label className={`mt-3 flex cursor-pointer items-start gap-2.5 text-left font-sans text-xs leading-relaxed ${small}`}>
        <input
          type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentErr(false); }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#FB003F] focus-visible:ring-2 focus-visible:ring-pink/60"
          aria-describedby="nl-doi-note"
        />
        <span>
          {de ? (
            <>Ich bin einverstanden, dass Bandita mir den Newsletter schickt. Details in der{" "}
              <Link href={`/${lang}/datenschutz`} className="underline underline-offset-2 hover:text-pink">Datenschutzerklärung</Link>.</>
          ) : (
            <>I agree that Bandita may send me the newsletter. Details in the{" "}
              <Link href={`/${lang}/datenschutz`} className="underline underline-offset-2 hover:text-pink">privacy policy</Link>.</>
          )}
        </span>
      </label>
      {consentErr && (
        <p className="mt-2 font-sans text-xs text-pink">
          {de ? "Bitte Häkchen setzen — ohne Einwilligung kein Bandit Letter." : "Please tick the box — no consent, no Bandit Letter."}
        </p>
      )}
      <p id="nl-doi-note" className={`mt-2 font-sans text-[11px] leading-relaxed ${small}`}>
        {de
          ? "Du bekommst eine Bestätigungs-Mail (Double-Opt-in). Abmelden jederzeit mit einem Klick."
          : "You'll get a confirmation email (double opt-in). Unsubscribe any time with one click."}
      </p>
    </form>
  );
}
