"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { mailto, sendLead } from "@/lib/contact";

// Lightweight newsletter opt-in. Routes a categorised [Newsletter] mail to the
// office inbox (works on static export & Vercel alike — no backend needed).
export default function NewsletterSignup({ lang, tone = "dark" }: { lang: Locale; tone?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const res = await sendLead({
      category: "Newsletter",
      subject: email,
      message: `${lang === "de" ? "Newsletter-Anmeldung" : "Newsletter signup"}: ${email}`,
      email,
    });
    setBusy(false);
    if (res !== "sent") {
      // background delivery unavailable → prefilled mail so the lead survives
      window.location.href = mailto(
        "Newsletter",
        lang === "de" ? "Newsletter-Anmeldung" : "Newsletter signup",
        `${lang === "de" ? "Bitte für den Newsletter anmelden" : "Please sign me up"}: ${email}`,
      );
    }
    setDone(true);
  };
  const dark = tone === "dark";
  const border = dark ? "border-creme/25" : "border-ink/20";
  const text = dark ? "text-creme placeholder:text-creme/40" : "text-ink placeholder:text-ink/40";
  const btn = dark ? "bg-pink text-creme hover:bg-creme hover:text-ink" : "bg-ink text-creme hover:bg-pink";

  if (done) {
    return (
      <p className={`font-sans text-sm ${dark ? "text-creme/80" : "text-ink/70"}`}>
        {lang === "de" ? "Danke! Du bist dabei. 🖤" : "Thanks! You're on the list. 🖤"}
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder={lang === "de" ? "Deine E-Mail" : "Your email"}
        aria-label={lang === "de" ? "E-Mail für Newsletter" : "Email for newsletter"}
        className={`flex-1 rounded-full border ${border} bg-transparent px-5 py-3 font-sans text-sm ${text} outline-none transition-colors focus:border-pink`}
      />
      <button type="submit" disabled={busy} data-cursor="hover"
        className={`whitespace-nowrap rounded-full px-6 py-3 font-sans text-xs uppercase tracking-[0.14em] transition-colors disabled:opacity-60 ${btn}`}>
        {busy ? (lang === "de" ? "…" : "…") : lang === "de" ? "Anmelden" : "Subscribe"}
      </button>
    </form>
  );
}
