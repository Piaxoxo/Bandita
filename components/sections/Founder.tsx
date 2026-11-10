"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import ParticleHeadline from "@/components/anim/ParticleHeadline";
import Chapter from "@/components/editorial/Chapter";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/*
  Who is behind it.

  A face before a service list: the founder, large, in the office under the
  BANDITA poster, her two sentences set as the line, the rest of her text as
  body, and the three other Banditas in a row beneath. Everything here is the
  team text the agency already publishes on the about page — reused, not
  rewritten.

  The portrait comes in as a curtain: scroll draws it open from the top and
  the colour comes with it, grey to red hair. On ink, so the dark photograph
  belongs to the page instead of sitting on it.
*/

const PORTRAITS = ["pia-alice", "dino", "niddl", "michael-lehner"];

// the two sentences from the founder's text that carry the whole thing
const LINE = {
  de: "Sie entwickelt keine Kampagnen. Sie entwickelt Gründe, warum Menschen kaufen.",
  en: "She doesn't build campaigns. She builds reasons why people buy.",
};

export default function Founder({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const root = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();
  const de = lang === "de";
  const members = dict.about.team.members;
  const pia = members[0];
  const others = members.slice(1);
  const body = pia.craft.replace(LINE[lang], "").trim();

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fd-curtain",
        { clipPath: "inset(0 0 100% 0)", filter: "grayscale(1)" },
        {
          clipPath: "inset(0 0 0% 0)",
          filter: "grayscale(0)",
          ease: "none",
          scrollTrigger: { trigger: ".fd-frame", start: "top 85%", end: "top 25%", scrub: 0.6 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="founder"
      ref={root}
      data-tone="dark"
      className="relative px-5 py-28 text-creme md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <Chapter n="06" title={de ? "Wer dahintersteht" : "Who's behind it"} tone="creme" />
        </Reveal>

        <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12 md:gap-8">
          {/* the portrait */}
          <div className="fd-frame md:col-span-5">
            <Parallax speed={-30}>
              <div className="relative aspect-[4/5] overflow-hidden bg-creme/5">
                <Image
                  src={`/about/team/${PORTRAITS[0]}.jpg`}
                  alt={dict.about.team.imageAlt || `${pia.name} — ${pia.role}`}
                  fill
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="fd-curtain object-cover"
                />
              </div>
            </Parallax>
            <figcaption className="mt-3 flex justify-between font-sans text-[10px] uppercase tracking-[0.3em] text-creme/50">
              <span>{pia.name}</span>
              <span>{pia.role}</span>
            </figcaption>
          </div>

          {/* the words */}
          <div className="md:col-span-6 md:col-start-7 md:pt-10">
            <ParticleHeadline
              as="h2"
              text={pia.name}
              color="#FCF6EC"
              className="font-display text-5xl font-medium leading-[0.98] tracking-[-0.01em] text-creme sm:text-6xl md:text-7xl"
            />
            <Reveal>
              <p className="mt-10 max-w-xl font-display text-2xl italic leading-snug text-pink md:mt-12 md:text-4xl">
                {LINE[lang]}
              </p>
            </Reveal>
            <Reveal>
              <p className="mt-8 max-w-xl font-sans text-base leading-relaxed text-creme/70 md:text-lg">{body}</p>
            </Reveal>

            {/* the other Banditas */}
            <Reveal className="mt-14 md:mt-20">
              <div className="flex items-center justify-between border-b border-creme/15 pb-3 font-sans text-[10px] uppercase tracking-[0.42em] text-creme/55">
                <span>{dict.about.team.kicker}</span>
                <Link href={`/${lang}/about`} data-cursor="link" className="group inline-flex items-center gap-2 transition-colors hover:text-pink">
                  {de ? "Das ganze Team" : "The whole team"}
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
              <ul className="mt-6 grid gap-6 sm:grid-cols-3">
                {others.map((m, i) => (
                  <li key={m.name} className="flex items-center gap-4">
                    <span className="relative block h-14 w-14 shrink-0 overflow-hidden ring-1 ring-creme/15">
                      <Image
                        src={`/about/team/${PORTRAITS[i + 1]}.jpg`}
                        alt={`${m.name} — ${m.role}`}
                        fill
                        sizes="56px"
                        className="object-cover object-top grayscale transition-all duration-700 hover:grayscale-0"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-lg leading-tight text-creme">{m.name}</span>
                      <span className="mt-1 block font-sans text-[10px] uppercase tracking-[0.2em] text-creme/50">{m.role}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
