"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { useQuote } from "@/components/quote/QuoteProvider";
import { scrollToId } from "@/lib/scroll";
import Wordmark from "./Wordmark";

/*
  The running head.

  On the homepage the masthead is printed on the cover (see editorial/Cover),
  so this bar stays out of the way until the cover has scrolled past, then
  slides in as the slim header every inner page has from the start. One
  hairline, the small lockup, links in wide caps, a text link for the ask.
  No pill, no blur-heavy glass: paper, a line, type.
*/
export default function Nav({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { introDone } = useSite();
  const { open: openQuote } = useQuote();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const barRef = useRef<HTMLElement>(null);

  const isHome = pathname === `/${lang}`;
  // About & Portfolio render dark worlds — flip the (otherwise ink) chrome to light.
  const dark = /^\/(en|de)\/(about|portfolio)(\/|$)/.test(pathname);
  // On the cover the masthead does this job; the bar waits until it is gone.
  const hidden = isHome && scrollY < 220 && !open;
  const scrolled = scrollY > 40;

  const links: { key: string; label: string; href?: string; anchor?: string }[] = [
    { key: "about", label: dict.nav.about, href: `/${lang}/about` },
    { key: "services", label: dict.nav.services, href: `/${lang}/services` },
    { key: "portfolio", label: dict.nav.portfolio, href: `/${lang}/portfolio` },
    { key: "contact", label: dict.nav.contact, anchor: "contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!introDone || !barRef.current || isHome) return;
    gsap.fromTo(barRef.current, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", delay: 0.2 });
  }, [introDone, isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleAnchor = (anchor?: string) => {
    setOpen(false);
    if (!anchor) return;
    if (isHome) setTimeout(() => scrollToId(anchor), 60);
    else router.push(`/${lang}#${anchor}`);
  };
  const handleHref = () => setOpen(false);

  const otherLang: Locale = lang === "en" ? "de" : "en";
  const switchedPath = pathname.replace(/^\/(en|de)/, `/${otherLang}`);

  const fg = dark ? "text-creme" : "text-ink";
  const fgSoft = dark ? "text-creme/60" : "text-ink/60";
  const rule = dark ? "border-creme/15" : "border-ink/15";
  const paper = dark ? "bg-ink/94" : "bg-creme/96";

  return (
    <>
      <header
        ref={barRef}
        className={`fixed inset-x-0 top-0 z-[55] border-b transition-[transform,opacity,background-color] duration-700 ease-bandita ${rule} ${
          hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        } ${scrolled || dark ? `${paper} backdrop-blur-sm` : "bg-transparent"}`}
        style={{ opacity: introDone || isHome ? undefined : 0 }}
      >
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5 md:h-16 md:px-10">
          <button
            onClick={() => {
              setOpen(false);
              if (isHome) scrollToId("top");
              else router.push(`/${lang}`);
            }}
            aria-label="BANDITA — Home"
            data-cursor="link"
            className="flex items-center"
          >
            <Wordmark className="text-[1.35rem] md:text-2xl" subtitle={false} tone={dark ? "creme" : "pink"} />
          </button>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {links.map((l) => {
              const cls = `group relative font-sans text-[11px] uppercase tracking-[0.3em] transition-colors hover:text-pink ${fg}`;
              const inner = (
                <>
                  {l.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-pink transition-all duration-300 group-hover:w-full" />
                </>
              );
              return l.href ? (
                <Link key={l.key} href={l.href} onClick={handleHref} data-cursor="link" className={cls}>
                  {inner}
                </Link>
              ) : (
                <button key={l.key} onClick={() => handleAnchor(l.anchor)} data-cursor="link" className={cls}>
                  {inner}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-5 md:gap-8">
            <Link
              href={switchedPath}
              data-cursor="link"
              aria-label={`Switch language to ${otherLang.toUpperCase()}`}
              className={`hidden items-center gap-1 font-sans text-[11px] uppercase tracking-[0.3em] sm:flex ${fgSoft}`}
            >
              <span className={lang === "en" ? "text-pink" : ""}>EN</span>
              <span className="opacity-40">/</span>
              <span className={lang === "de" ? "text-pink" : ""}>DE</span>
            </Link>

            {/* The ask, as type — not a pill. */}
            <button
              onClick={() => {
                setOpen(false);
                openQuote();
              }}
              data-cursor="hover"
              className={`group hidden items-center gap-2 font-sans text-[11px] uppercase tracking-[0.3em] transition-colors hover:text-pink md:inline-flex ${fg}`}
            >
              {dict.nav.cta}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? dict.nav.close : dict.nav.menu}
              aria-expanded={open}
              data-cursor="link"
              className="relative z-[57] flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`block h-px w-6 transition-all duration-300 ${open ? "bg-ink" : dark ? "bg-creme" : "bg-ink"} ${
                    open && i === 0 ? "translate-y-[6px] rotate-45" : ""
                  } ${open && i === 1 ? "opacity-0" : ""} ${open && i === 2 ? "-translate-y-[6px] -rotate-45" : ""}`}
                />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — a sibling of <header>, not a child: the header carries a
          transform, which would otherwise make this fixed overlay resolve
          against the header box instead of the viewport. */}
      <div
        className={`fixed inset-0 z-[56] flex flex-col bg-creme transition-[clip-path] duration-700 ease-bandita lg:hidden ${
          open ? "[clip-path:circle(150%_at_100%_0)]" : "pointer-events-none [clip-path:circle(0%_at_100%_0)]"
        }`}
      >
        <div className="mx-5 mt-24 flex items-center justify-between border-b border-ink pb-3 font-sans text-[10px] uppercase tracking-[0.42em] text-ink/55">
          <span>{lang === "de" ? "Inhalt" : "Contents"}</span>
          <span>Wien</span>
        </div>
        <nav className="flex flex-col px-5" aria-label="Mobile">
          {[{ key: "home", label: dict.nav.home, href: `/${lang}` }, ...links].map((l, i) => {
            const cls =
              "flex items-baseline justify-between border-b border-ink/10 py-5 text-left font-display text-4xl text-ink transition-colors hover:text-pink";
            const style = { transitionDelay: open ? `${i * 40}ms` : "0ms" };
            const num = <span className="font-sans text-[10px] tracking-[0.3em] text-ink/40">0{i + 1}</span>;
            return l.href ? (
              <Link key={l.key} href={l.href} onClick={handleHref} className={cls} style={style}>
                {l.label} {num}
              </Link>
            ) : (
              <button key={l.key} onClick={() => handleAnchor(l.anchor)} className={cls} style={style}>
                {l.label} {num}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between px-5 pb-10 font-sans text-[11px] uppercase tracking-[0.3em]">
          <Link href={switchedPath} onClick={() => setOpen(false)} className="text-ink/60">
            {lang === "en" ? "Deutsch" : "English"}
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              openQuote();
            }}
            className="inline-flex items-center gap-2 text-ink"
          >
            {dict.nav.cta} <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </>
  );
}
