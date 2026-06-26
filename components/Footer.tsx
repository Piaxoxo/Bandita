import type { Dictionary } from "@/i18n/types";
import Wordmark from "./Wordmark";

export default function Footer({ dict }: { dict: Dictionary }) {
  const year = 2026; // build-time constant; bump per release

  return (
    <footer className="relative z-10 bg-ink px-5 pb-10 pt-20 text-creme md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col items-start justify-between gap-12 border-b border-creme/15 pb-14 md:flex-row md:items-end">
          <div className="text-pink">
            <Wordmark />
          </div>
          <p className="max-w-sm font-display text-2xl leading-snug text-creme/90 md:text-right">
            {dict.footer.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-8 font-sans text-xs uppercase tracking-[0.15em] text-creme/50 md:flex-row md:items-center md:justify-between">
          <span>
            © {year} BANDITA — {dict.footer.rights}
          </span>
          <span>{dict.footer.based}</span>
          <span className="text-creme/30">{dict.footer.phaseNote}</span>
        </div>
      </div>
    </footer>
  );
}
