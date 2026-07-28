"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { QUOTE } from "./services-data";

const EMAIL = "agencybandita@gmail.com"; // callbacks + requests land here

export default function QuoteModal({
  open,
  onClose,
  lang,
  prefill,
}: {
  open: boolean;
  onClose: () => void;
  lang: Locale;
  prefill?: string | null;
}) {
  const [services, setServices] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);

  // preselect a service when opened from a specific card
  useEffect(() => {
    if (open && prefill) setServices((s) => (s.includes(prefill) ? s : [...s, prefill]));
  }, [open, prefill]);

  // ESC to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggleService = (key: string) =>
    setServices((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const submit = () => {
    if (!email.trim() && !phone.trim()) {
      setError(true);
      return;
    }
    setError(false);
    const labelFor = (key: string) => QUOTE.services.find((s) => s.key === key)?.label[lang] ?? key;
    const body = [
      `${QUOTE.qServices[lang]}: ${services.map(labelFor).join(", ") || "—"}`,
      `${QUOTE.qGoal[lang]}: ${goal || "—"}`,
      `${QUOTE.qBusiness[lang]}: ${business || "—"}`,
      "",
      `${QUOTE.qName[lang]}: ${name || "—"}`,
      `${QUOTE.qEmail[lang]}: ${email || "—"}`,
      `${QUOTE.qPhone[lang]}: ${phone || "—"}`,
      message ? `\n${QUOTE.qMessage[lang]}: ${message}` : "",
    ].join("\n");
    const subject = `${lang === "de" ? "Angebotsanfrage" : "Offer request"}${business ? " — " + business : ""}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const chip = (active: boolean) =>
    `rounded-full px-4 py-2 font-sans text-[13px] transition-colors ${
      active ? "bg-pink text-creme" : "border border-ink/15 text-ink/70 hover:border-pink hover:text-pink"
    }`;
  const field =
    "mt-1.5 w-full rounded-xl border border-ink/15 bg-white/60 px-4 py-3 font-sans text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-pink";
  const legend = "font-sans text-sm font-medium uppercase tracking-[0.1em] text-ink/60";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={QUOTE.title[lang]}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-creme p-7 shadow-[0_-20px_80px_rgba(0,0,0,0.4)] sm:rounded-3xl sm:p-9"
      >
        {/* close */}
        <button
          onClick={onClose}
          data-cursor="link"
          aria-label={lang === "de" ? "Schließen" : "Close"}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-pink hover:text-pink"
        >
          ✕
        </button>

        {sent ? (
          <div className="py-10 text-center">
            <p className="font-display text-3xl font-medium text-pink">✓</p>
            <h2 className="mt-4 font-display text-3xl font-medium tracking-[-0.01em]">{QUOTE.title[lang]}</h2>
            <p className="mx-auto mt-4 max-w-md font-sans text-[15px] leading-relaxed text-ink/70">{QUOTE.success[lang]}</p>
            <p className="mt-6 font-sans text-sm text-ink/60">
              {QUOTE.successPhone[lang]}{" "}
              <a href={`mailto:${EMAIL}`} className="text-pink underline underline-offset-2">{EMAIL}</a>
            </p>
            <button
              onClick={onClose}
              className="mt-8 rounded-full bg-ink px-8 py-3 font-sans text-xs uppercase tracking-[0.14em] text-creme transition-colors hover:bg-pink"
            >
              {lang === "de" ? "Schließen" : "Close"}
            </button>
          </div>
        ) : (
          <>
            <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-pink">
              {lang === "de" ? "Unverbindlich" : "Non-binding"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.01em] md:text-4xl">{QUOTE.title[lang]}</h2>
            <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink/60">{QUOTE.subtitle[lang]}</p>

            {/* services (multi) */}
            <fieldset className="mt-7">
              <legend className={legend}>{QUOTE.qServices[lang]}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUOTE.services.map((s) => (
                  <button type="button" key={s.key} data-cursor="link" onClick={() => toggleService(s.key)} className={chip(services.includes(s.key))}>
                    {s.label[lang]}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* goal (single) */}
            <fieldset className="mt-6">
              <legend className={legend}>{QUOTE.qGoal[lang]}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUOTE.goals.map((g) => (
                  <button type="button" key={g.en} data-cursor="link" onClick={() => setGoal(g[lang])} className={chip(goal === g[lang])}>
                    {g[lang]}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* business (single) */}
            <fieldset className="mt-6">
              <legend className={legend}>{QUOTE.qBusiness[lang]}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUOTE.businessTypes.map((btp) => (
                  <button type="button" key={btp.en} data-cursor="link" onClick={() => setBusiness(btp[lang])} className={chip(business === btp[lang])}>
                    {btp[lang]}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* contact */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={legend}>{QUOTE.qName[lang]}</span>
                <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
              <label className="block">
                <span className={legend}>{QUOTE.qEmail[lang]}</span>
                <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@mail.com" />
              </label>
              <label className="block sm:col-span-2">
                <span className={legend}>{QUOTE.qPhone[lang]}</span>
                <input type="tel" className={field} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+43 …" />
              </label>
              <label className="block sm:col-span-2">
                <span className={legend}>{QUOTE.qMessage[lang]}</span>
                <textarea rows={3} className={field} value={message} onChange={(e) => setMessage(e.target.value)} />
              </label>
            </div>

            {error && <p className="mt-4 font-sans text-sm text-pink">{QUOTE.required[lang]}</p>}

            <div className="mt-7 flex flex-col items-center gap-3">
              <button
                onClick={submit}
                data-cursor="hover"
                className="w-full rounded-full bg-pink px-8 py-4 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-ink sm:w-auto sm:px-12"
              >
                {QUOTE.submit[lang]}
              </button>
              <p className="font-sans text-xs text-ink/45">{QUOTE.note[lang]}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
