"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import QuoteModal from "./QuoteModal";

type QuoteCtx = { open: (prefill?: string | null) => void };

const Ctx = createContext<QuoteCtx>({ open: () => {} });

export const useQuote = () => useContext(Ctx);

// Makes the "build your offer" modal reachable from any CTA on any page.
export default function QuoteProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);
  const doOpen = (p?: string | null) => { setPrefill(p ?? null); setOpen(true); };
  return (
    <Ctx.Provider value={{ open: doOpen }}>
      {children}
      <QuoteModal open={open} onClose={() => setOpen(false)} lang={lang} prefill={prefill} />
    </Ctx.Provider>
  );
}
