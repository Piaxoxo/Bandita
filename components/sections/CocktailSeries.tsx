"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/i18n/config";
import { useSite } from "@/lib/site-context";
import Chapter from "@/components/editorial/Chapter";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/*
  The series: five glasses, five colours, five names.

  The section pins and the scroll becomes horizontal — each glass is cut
  from its photograph and stands on a flat field of one brand colour, with
  its name set huge behind it so the glass overlaps the letters. The field
  changes colour as the next glass slides in; the glass moves a little
  slower than its name, which is what gives the slide depth.

  These are concept images (AI-generated, the agency's own words) and the
  corner says so. Names and ingredient lines are taken from the posters the
  images came as — nothing is added to them.
*/

type Drink = {
  id: string;
  src: string;
  w: number;
  h: number;
  name: { de: string; en: string };
  sub: { de: string; en: string };
  bg: string;
  /** type colour on that field */
  fg: "ink" | "creme";
};

const DRINKS: Drink[] = [
  {
    id: "chai", src: "/cocktails/chai.webp", w: 561, h: 958,
    name: { de: "Chai Latte", en: "Chai Latte" },
    sub: { de: "Vodka · Chai-Sirup · Vanille · Crème · Zimt", en: "Vodka · chai syrup · vanilla · cream · cinnamon" },
    bg: "#FB003F", fg: "creme",
  },
  {
    id: "pumpkin", src: "/cocktails/pumpkin.webp", w: 595, h: 1218,
    name: { de: "Pumpkin Martini", en: "Pumpkin Martini" },
    sub: { de: "Vodka · Pumpkin Spice · Vanille · Ahorn · Crème", en: "Vodka · pumpkin spice · vanilla · maple · cream" },
    bg: "#5FC9BC", fg: "ink",
  },
  {
    id: "onyx", src: "/cocktails/onyx.webp", w: 590, h: 931,
    name: { de: "Onyx Margarita", en: "Onyx Margarita" },
    sub: { de: "Tequila Reposado · Brombeere · Limette · Agave · Glitzer", en: "Tequila reposado · blackberry · lime · agave · edible glitter" },
    bg: "#FFC23D", fg: "ink",
  },
  {
    id: "truffle", src: "/cocktails/truffle.webp", w: 569, h: 761,
    name: { de: "Truffle Sour", en: "Truffle Sour" },
    sub: { de: "Trüffel-Gin · Zitrone · Holunderblüte · Eiweiß · Schwarzer Trüffel", en: "Truffle-infused gin · lemon · elderflower · egg white · black truffle" },
    bg: "#1A1216", fg: "creme",
  },
];

export default function CocktailSeries({ lang }: { lang: Locale }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSite();
  const [index, setIndex] = useState(0);
  const de = lang === "de";
  const n = DRINKS.length;

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || reducedMotion) return;

    const ctx = gsap.context(() => {
      const glasses = gsap.utils.toArray<HTMLElement>(".cs-glass");
      const names = gsap.utils.toArray<HTMLElement>(".cs-name");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          // one viewport of scroll per slide change
          end: () => `+=${(n - 1) * window.innerHeight}`,
          pin: true,
          scrub: 0.7,
          // No snap: ScrollTrigger's snap tween and Lenis both write the
          // scroll position and fight over it (the page jumped by screens on
          // touch). The slides are a continuous strip instead.
          onUpdate: (self) => setIndex(Math.round(self.progress * (n - 1))),
          invalidateOnRefresh: true,
        },
      });

      // the track slides one screen per unit of time
      tl.to(tr, { xPercent: (-100 * (n - 1)) / n, duration: n - 1 }, 0);

      // each glass drifts against its own slide: it is on screen from one
      // unit before its slot to one after, and crosses ~a third of the
      // screen in that time, tilting with the motion
      glasses.forEach((g, i) => {
        const from = i === 0 ? 0 : 1;
        const to = i === n - 1 ? 0 : 1;
        const span = from + to;
        if (!span) return;
        tl.fromTo(
          g,
          { xPercent: 28 * from, rotate: 4 * from },
          { xPercent: -28 * to, rotate: -4 * to, duration: span },
          i - from,
        );
      });
      // the names move the other way, slightly, so letters and glass part
      names.forEach((m, i) => {
        const from = i === 0 ? 0 : 1;
        const to = i === n - 1 ? 0 : 1;
        const span = from + to;
        if (!span) return;
        tl.fromTo(m, { xPercent: -10 * from }, { xPercent: 10 * to, duration: span }, i - from);
      });
    }, el);

    return () => ctx.revert();
  }, [reducedMotion, n]);

  const current = DRINKS[Math.min(index, n - 1)];
  const fg = current.fg === "ink" ? "text-ink" : "text-creme";
  const fgSoft = current.fg === "ink" ? "text-ink/60" : "text-creme/60";

  return (
    <section
      id="serie"
      ref={root}
      data-tone="dark"
      className="relative overflow-hidden transition-colors duration-700 ease-bandita"
      style={{ backgroundColor: current.bg }}
    >
      <div className={`relative flex h-[100svh] flex-col ${fg}`}>
        {/* chapter head, fixed within the pinned screen */}
        <div className="absolute inset-x-0 top-0 z-20 px-5 pt-24 md:px-10 md:pt-28">
          <div className="mx-auto max-w-[1600px]">
            {/* the number takes the type colour: its own Gelb vanishes on the Gelb slide */}
            <Chapter n="03" title={de ? "Serie" : "Series"} tone={current.fg} color={current.fg === "ink" ? "#1A1216" : "#FCF6EC"} />
          </div>
        </div>

        {/* the slides */}
        <div
          ref={track}
          className={`flex h-full ${reducedMotion ? "flex-col" : ""}`}
          style={reducedMotion ? undefined : { width: `${n * 100}%` }}
        >
          {DRINKS.map((d, i) => {
            const dfg = d.fg === "ink" ? "text-ink" : "text-creme";
            return (
              <article
                key={d.id}
                // overflow-hidden: the name drifts against the slide and must
                // not bleed into the neighbour
                className={`relative flex h-full shrink-0 items-center justify-center overflow-hidden ${reducedMotion ? "min-h-[100svh]" : ""}`}
                style={{ width: reducedMotion ? "100%" : `${100 / n}%`, backgroundColor: reducedMotion ? d.bg : undefined }}
              >
                {/* the name, huge, behind the glass — sized to its length so
                    "Pumpkin Martini" fits one line where "Chai Latte" fills it;
                    phones let it wrap instead */}
                <div
                  aria-hidden
                  className={`cs-name pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none px-2 text-center font-display text-[20vw] italic leading-[0.85] tracking-[-0.03em] md:whitespace-nowrap md:text-[length:var(--nm)] ${reducedMotion ? dfg : ""}`}
                  style={{ "--nm": `${Math.min(13.5, 158 / d.name[lang].length)}vw` } as React.CSSProperties}
                >
                  {d.name[lang]}
                </div>

                {/* the glass, in front */}
                <div className="cs-glass relative z-10 h-[62svh] w-auto md:h-[76svh]">
                  <Image
                    src={d.src}
                    alt={`${d.name[lang]} — ${d.sub[lang]}`}
                    width={d.w}
                    height={d.h}
                    sizes="(min-width: 768px) 46vh, 60vh"
                    priority={i === 0}
                    className="h-full w-auto object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.38)]"
                  />
                </div>

                {/* the caption, read by screen readers through the alt above */}
                {/* bottom padding clears the fixed accessibility button */}
                <div className={`absolute inset-x-0 bottom-0 z-20 px-5 pb-20 md:px-10 md:pb-24 ${reducedMotion ? dfg : ""}`}>
                  <div className="mx-auto flex max-w-[1600px] items-end justify-between gap-6 font-sans text-[10px] uppercase tracking-[0.3em] md:text-[11px]">
                    <div className="max-w-[70%] md:max-w-none">
                      <h3 className="font-display text-2xl normal-case tracking-normal md:text-4xl">{d.name[lang]}</h3>
                      <p className="mt-2 opacity-60">{d.sub[lang]}</p>
                    </div>
                    <span className="whitespace-nowrap font-display text-base tracking-normal opacity-70 md:text-lg">
                      0{i + 1}<span className="opacity-50"> / 0{n}</span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* the honest corner */}
        <p className={`pointer-events-none absolute inset-x-0 bottom-8 z-20 hidden text-center font-sans text-[9px] uppercase tracking-[0.3em] md:block ${fgSoft}`}>
          {de ? "Konzeptstudie · Bilder KI-generiert" : "Concept study · AI-generated images"}
        </p>
      </div>
    </section>
  );
}
