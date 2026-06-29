"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { scrollToId } from "@/lib/scroll";
import Wordmark from "./Wordmark";
import MagneticButton from "./MagneticButton";

export default function Nav({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const { introDone } = useSite();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  const isHome = pathname === `/${lang}`;
  // About & Portfolio render dark worlds — flip the (otherwise ink) chrome to light.
  const dark = /^\/(en|de)\/(about|portfolio)(\/|$)/.test(pathname);

  // links — About is its own page; Services/Contact resolve to homepage anchors.
  // Unbuilt pages are flagged "soon".
  const links: {
    key: string;
    label: string;
    href?: string;
    anchor?: string;
    ready: boolean;
  }[] = [
    { key: "about", label: dict.nav.about, href: `/${lang}/about`, ready: true },
    { key: "services", label: dict.nav.services, anchor: "capabilities", ready: true },
    { key: "portfolio", label: dict.nav.portfolio, href: `/${lang}/portfolio`, ready: true },
    { key: "journal", label: dict.nav.journal, ready: false },
    { key: "contact", label: dict.nav.contact, anchor: "contact", ready: true },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!introDone || !barRef.current) return;
    gsap.fromTo(
      barRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "expo.out", delay: 0.2 },
    );
  }, [introDone]);

  // lock scroll for mobile menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Anchor links live on the homepage. From any other route, navigate home
  // with a hash; the homepage hash-scroll handler (SmoothScroll) finishes the job.
  const handleAnchor = (anchor?: string) => {
    setOpen(false);
    if (!anchor) return;
    if (isHome) {
      setTimeout(() => scrollToId(anchor), 60);
    } else {
      router.push(`/${lang}#${anchor}`);
    }
  };

  const handleHref = () => setOpen(false);

  const otherLang: Locale = lang === "en" ? "de" : "en";
  const switchedPath = pathname.replace(/^\/(en|de)/, `/${otherLang}`);

  return (
    <>
    <header
      ref={barRef}
      className={`fixed inset-x-0 top-0 z-[55] transition-all duration-500 ease-bandita ${
        scrolled ? "py-3" : "py-5"
      }`}
      style={{ opacity: introDone ? undefined : 0 }}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 md:px-10">
        {/* Logo */}
        <button
          onClick={() => {
            setOpen(false);
            scrollToId("top");
          }}
          aria-label="BANDITA — Home"
          data-cursor="link"
          className={`transition-colors duration-500 ${
            scrolled || open ? "text-pink" : "text-pink"
          }`}
        >
          <Wordmark subtitle={!scrolled} />
        </button>

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((l) => {
            const cls = `group relative font-sans text-sm uppercase tracking-[0.12em] transition-colors ${
              l.ready
                ? dark
                  ? "text-creme/80 hover:text-pink"
                  : "text-ink/80 hover:text-pink"
                : dark
                  ? "cursor-not-allowed text-creme/30"
                  : "cursor-not-allowed text-ink/30"
            }`;
            const inner = (
              <>
                {l.label}
                {!l.ready && (
                  <sup className="ml-1 text-[8px] uppercase tracking-wider text-pink/70">
                    {dict.nav.soon}
                  </sup>
                )}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-pink transition-all duration-300 group-hover:w-full" />
              </>
            );
            return l.href && l.ready ? (
              <Link key={l.key} href={l.href} onClick={handleHref} data-cursor="link" className={cls}>
                {inner}
              </Link>
            ) : (
              <button
                key={l.key}
                onClick={() => l.ready && handleAnchor(l.anchor)}
                data-cursor="link"
                disabled={!l.ready}
                className={cls}
              >
                {inner}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Language switch */}
          <Link
            href={switchedPath}
            data-cursor="link"
            aria-label={`Switch language to ${otherLang.toUpperCase()}`}
            className={`hidden items-center gap-1 font-sans text-xs uppercase tracking-[0.15em] transition-colors hover:text-pink sm:flex ${
              dark ? "text-creme/60" : "text-ink/60"
            }`}
          >
            <span className={lang === "en" ? "text-pink" : ""}>EN</span>
            <span className={dark ? "text-creme/30" : "text-ink/30"}>/</span>
            <span className={lang === "de" ? "text-pink" : ""}>DE</span>
          </Link>

          {/* CTA (desktop) */}
          <MagneticButton
            onClick={() => handleAnchor("contact")}
            cursor="hover"
            className={`hidden rounded-full px-6 py-3 font-sans text-xs uppercase tracking-[0.15em] transition-colors md:inline-flex ${
              dark
                ? "bg-creme text-ink hover:bg-pink hover:text-creme"
                : "bg-ink text-creme hover:bg-pink"
            }`}
          >
            {dict.nav.cta}
          </MagneticButton>

          {/* Burger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? dict.nav.close : dict.nav.menu}
            aria-expanded={open}
            data-cursor="link"
            className="relative z-[57] flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span
              className={`block h-[2px] w-6 transition-all duration-300 ${open ? "bg-ink" : dark ? "bg-creme" : "bg-ink"} ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 transition-all duration-300 ${open ? "bg-ink" : dark ? "bg-creme" : "bg-ink"} ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 transition-all duration-300 ${open ? "bg-ink" : dark ? "bg-creme" : "bg-ink"} ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </header>

      {/* Mobile menu overlay — rendered as a sibling of <header>, not a child.
          The header carries a GSAP transform, which would otherwise make this
          position:fixed element resolve against the header box instead of the
          viewport (collapsing the full-screen overlay). */}
      <div
        className={`fixed inset-0 z-[56] flex flex-col bg-creme transition-[clip-path] duration-700 ease-bandita lg:hidden ${
          open
            ? "[clip-path:circle(150%_at_100%_0)]"
            : "pointer-events-none [clip-path:circle(0%_at_100%_0)]"
        }`}
      >
        <nav className="mt-28 flex flex-col gap-1 px-8" aria-label="Mobile">
          {[
            { key: "home", label: dict.nav.home, href: `/${lang}`, ready: true },
            ...links,
          ].map((l, i) => {
            const cls = `flex items-baseline justify-between border-b border-ink/10 py-5 text-left font-display text-4xl transition-colors ${
              l.ready ? "text-ink hover:text-pink" : "text-ink/30"
            }`;
            const style = { transitionDelay: open ? `${i * 40}ms` : "0ms" };
            const inner = (
              <>
                {l.label}
                {!l.ready && (
                  <span className="text-xs uppercase tracking-widest text-pink/70">
                    {dict.nav.soon}
                  </span>
                )}
              </>
            );
            return l.href && l.ready ? (
              <Link key={l.key} href={l.href} onClick={handleHref} className={cls} style={style}>
                {inner}
              </Link>
            ) : (
              <button
                key={l.key}
                onClick={() => l.ready && handleAnchor(l.anchor)}
                disabled={!l.ready}
                className={cls}
                style={style}
              >
                {inner}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center justify-between px-8 pb-10">
          <Link
            href={switchedPath}
            onClick={() => setOpen(false)}
            className="font-sans text-sm uppercase tracking-[0.15em] text-ink/60"
          >
            {lang === "en" ? "Deutsch" : "English"}
          </Link>
          <button
            onClick={() => handleAnchor("contact")}
            className="rounded-full bg-ink px-6 py-3 font-sans text-xs uppercase tracking-[0.15em] text-creme"
          >
            {dict.nav.cta}
          </button>
        </div>
      </div>
    </>
  );
}
