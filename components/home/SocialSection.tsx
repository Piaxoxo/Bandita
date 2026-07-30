"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { useSite } from "@/lib/site-context";
import Reveal from "@/components/anim/Reveal";
import Reveal3D from "@/components/anim/Reveal3D";
import { SOCIAL_LINKS, utm, type SocialChannel } from "@/lib/social";
import { SOCIAL_ICONS } from "@/components/SocialIcons";

// Cheeky one-liner per channel — Bandita voice, DE + EN.
const LINES: Record<string, { de: string; en: string }> = {
  instagram: { de: "Hinter den Kulissen. Vor der Konkurrenz.", en: "Behind the scenes. Ahead of the competition." },
  facebook: { de: "Ja, wir sind auch dort. Deine Kunden nämlich auch.", en: "Yes, we're there too. So are your customers." },
  linkedin: { de: "Business. Aber nicht langweilig.", en: "Business. Just not boring." },
};

// One 3D card: pointer tilt (rAF-capped, transform-only), glare that follows
// the mouse, platform-coloured gradient border, glassmorphism body. Touch
// devices float gently instead; reduced-motion keeps everything static.
function SocialCard({ s, lang, reduced, canHover }: { s: SocialChannel; lang: Locale; reduced: boolean; canHover: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const busy = useRef(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (reduced || !canHover || !el || busy.current) return;
    busy.current = true;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    requestAnimationFrame(() => {
      busy.current = false;
      el.style.transition = "transform 0s";
      el.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg)`;
      el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
      el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .7s cubic-bezier(.16,1,.3,1)"; // soft spring back
    el.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  const Icon = SOCIAL_ICONS[s.key];
  const line = LINES[s.key];

  return (
    <a
      ref={ref}
      href={utm(s.url, "social_section")}
      target="_blank"
      rel="noopener"
      aria-label={`Bandita ${lang === "de" ? "auf" : "on"} ${s.name} — ${s.handle}`}
      data-cursor="hover"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative block rounded-3xl p-[1.5px] [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-pink/60 ${
        !canHover && !reduced ? "animate-float-slow" : ""
      }`}
      style={{
        willChange: "transform",
        background: `linear-gradient(135deg, ${s.color}55, transparent 45%, transparent 55%, ${s.color}33)`,
      }}
    >
      {/* gradient border lights up on hover */}
      <span aria-hidden className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}44 55%, ${s.color})` }} />

      {/* glassmorphism body */}
      <div className="relative flex h-full flex-col items-center rounded-[calc(1.5rem-1.5px)] bg-creme/70 px-6 py-10 text-center backdrop-blur-md [transform-style:preserve-3d]">
        {/* moving glare */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(220px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.55), transparent 65%)" }} />

        {/* logo floats above the card plane */}
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-ink transition-colors duration-300"
          style={{ transform: "translateZ(46px)", color: undefined }}
        >
          <span className="transition-colors duration-300 group-hover:!text-[var(--pc)]" style={{ "--pc": s.color } as React.CSSProperties}>
            <Icon className="h-12 w-12" />
          </span>
        </span>

        {/* handle + line hover slightly above the plane */}
        <div style={{ transform: "translateZ(26px)" }}>
          <p className="mt-5 font-sans text-xs uppercase tracking-[0.2em] text-ink/50">{s.name}</p>
          <p className="mt-1 font-display text-xl font-medium tracking-[-0.01em] text-ink">{s.handle}</p>
          <p className="mt-3 font-display text-base italic leading-snug text-ink/70">{line[lang]}</p>
        </div>

        <span
          className="mt-6 inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.16em] text-ink/50 transition-colors group-hover:text-ink"
          style={{ transform: "translateZ(18px)" }}
        >
          {lang === "de" ? "Folgen" : "Follow"} <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </a>
  );
}

export default function SocialSection({ lang }: { lang: Locale }) {
  const { reducedMotion: r } = useSite();
  const [canHover, setCanHover] = useState(true);
  const de = lang === "de";

  // touch devices get the float animation instead of pointer tilt
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  return (
    <section className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32" aria-labelledby="social-heading">
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(45% 45% at 50% 20%, rgba(251,0,63,0.08), transparent 70%)" }} />
      <div className="relative mx-auto max-w-[1500px]">
        <div className="text-center">
          <Reveal>
            <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.4em] text-pink">Social</p>
          </Reveal>
          <Reveal as="h2" id="social-heading" className="font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl">
            Follow the Bandits.
          </Reveal>
          <Reveal>
            <p className="mt-3 font-display text-xl italic text-ink/60 md:text-2xl">
              {de ? "Deine Konkurrenz tut es längst." : "Your competitors already do."}
            </p>
          </Reveal>
        </div>

        <div style={{ perspective: "1200px" }}>
          <Reveal3D className="mt-14 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-[1100px] lg:grid-cols-3" stagger={0.09}>
            {SOCIAL_LINKS.map((s) => (
              <SocialCard key={s.key} s={s} lang={lang} reduced={r} canHover={canHover} />
            ))}
          </Reveal3D>
        </div>
      </div>
    </section>
  );
}
