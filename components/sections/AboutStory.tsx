"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { useSite } from "@/lib/site-context";
import { scrollToId } from "@/lib/scroll";
import { aboutScene } from "@/lib/about-scene";
import Reveal from "@/components/anim/Reveal";
import MagneticButton from "@/components/MagneticButton";
import AboutSceneLayer from "@/components/webgl/AboutSceneLayer";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ── Tracked kicker with a hairline ─────────────────────────────────────── */
function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.34em] ${className}`}>
      <span className="h-px w-8 bg-current opacity-50" />
      {children}
    </span>
  );
}

/* ── Cursor-reactive 3D tilt card ───────────────────────────────────────── */
function TiltCard({
  children,
  className = "",
  disabled,
}: {
  children: ReactNode;
  className?: string;
  disabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (disabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(ref.current, {
      rotateY: px * 14,
      rotateX: -py * 16,
      duration: 0.5,
      ease: "power3.out",
      transformPerspective: 800,
    });
  };
  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });
  };
  return (
    <div style={{ perspective: 900 }} className={className}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="will-change-transform [transform-style:preserve-3d]"
      >
        {children}
      </div>
    </div>
  );
}

export default function AboutStory({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const a = dict.about;
  const { introDone, reducedMotion: r } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const heroInner = useRef<HTMLDivElement>(null);
  const [staticIllo, setStaticIllo] = useState(true);

  // Canvas now runs on every device; only reduce-motion uses the static art.
  useEffect(() => {
    setStaticIllo(r);
  }, [r]);

  /* Hero entrance (after the particle film) + mouse parallax */
  useEffect(() => {
    if (!introDone || !root.current) return;
    // When the canvas plays the woman→BANDITA film, the headline arrives after it.
    const filmActive = !staticIllo;
    const eyebrow = ".ah-eyebrow", lines = ".ah-line span", cue = ".ah-scroll";
    let revealed = false;
    const ctx = gsap.context(() => {
      if (r) {
        gsap.set([eyebrow, lines, cue], { opacity: 1, y: 0, yPercent: 0, rotateX: 0 });
        revealed = true;
        return;
      }
      gsap.set(eyebrow, { opacity: 0, y: 18 });
      gsap.set(lines, { opacity: 0, yPercent: 120, rotateX: -55 });
      gsap.set(cue, { opacity: 0 });
    }, root);

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.8 })
        .to(lines, { opacity: 1, yPercent: 0, rotateX: 0, duration: 1.2, stagger: 0.16 }, "-=0.4")
        .to(cue, { opacity: 1, duration: 0.8 }, "-=0.5");
    };

    let raf = 0;
    let lx = 0, ly = 0;
    const loop = () => {
      // headline arrives only once the particle film has dispersed
      if (!revealed && (!filmActive || aboutScene.heroReleased)) reveal();
      lx += (aboutScene.rawPointerX - lx) * 0.06;
      ly += (aboutScene.rawPointerY - ly) * 0.06;
      if (heroInner.current) {
        heroInner.current.style.transform = `translate3d(${lx * 18}px, ${ly * -12}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    if (!r) raf = requestAnimationFrame(loop);
    // safety: never leave the headline hidden if the canvas never starts
    const safety = window.setTimeout(reveal, 9000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
      ctx.revert();
    };
  }, [introDone, r, staticIllo]);

  /* Scroll-driven illustration formation + manifesto intensity + manifesto reveal */
  useEffect(() => {
    if (r || !root.current) return;
    const ctx = gsap.context(() => {
      const nameEl = document.getElementById("about-name");
      if (nameEl) {
        ScrollTrigger.create({
          trigger: nameEl,
          start: "top 85%",
          end: "bottom 15%",
          onUpdate: (self) => {
            aboutScene.cohesion = Math.sin(self.progress * Math.PI);
          },
          onLeave: () => (aboutScene.cohesion = 0),
          onLeaveBack: () => (aboutScene.cohesion = 0),
        });
      }
      const manifestoEl = document.getElementById("about-manifesto");
      if (manifestoEl) {
        ScrollTrigger.create({
          trigger: manifestoEl,
          start: "top 70%",
          end: "bottom bottom",
          onUpdate: (self) => {
            const bell = Math.sin(self.progress * Math.PI);
            aboutScene.intensity = bell * 0.9;
            aboutScene.explode = bell * 0.7; // the particles burst outward at the peak
          },
          onLeave: () => ((aboutScene.intensity = 0), (aboutScene.explode = 0)),
          onLeaveBack: () => ((aboutScene.intensity = 0), (aboutScene.explode = 0)),
        });
      }
      const finalEl = document.getElementById("about-final");
      if (finalEl) {
        ScrollTrigger.create({
          trigger: finalEl,
          start: "top 80%",
          end: "bottom bottom",
          onUpdate: (self) => {
            // re-form the glowing BANDITA wordmark for the closing line
            aboutScene.finale = Math.min(1, self.progress * 1.6);
          },
          onLeaveBack: () => (aboutScene.finale = 0),
        });
      }

      // Floating campaign plates — one per section, distributed down the page.
      const plateSecs = [
        "about-name",
        "about-why",
        "about-psych",
        "about-services",
        "about-work-focal",
        "about-manifesto",
      ];
      // smoothstep helper
      const ss = (e0: number, e1: number, x: number) => {
        const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
        return t * t * (3 - 2 * t);
      };
      plateSecs.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          end: "bottom 20%",
          onUpdate: (self) => {
            const p = self.progress;
            // reveal: ramp up → HOLD fully formed (0.36–0.64) → ramp down,
            // so the real photo is centred, sharp and recognisable for a beat
            const reveal = Math.min(ss(0.1, 0.36, p), 1 - ss(0.64, 0.92, p));
            // pass: continuous glide that lingers slowly through the centre
            // (never freezes) — graceful cinematic drift instead of a hard stop
            const x = p * 2 - 1;
            const pass = Math.sign(x) * Math.pow(Math.abs(x), 1.8);
            const ps = aboutScene.plates[i];
            ps.reveal = reveal;
            ps.pass = pass;
          },
          onLeave: () => (aboutScene.plates[i].reveal = 0),
          onLeaveBack: () => (aboutScene.plates[i].reveal = 0),
        });
      });
      gsap.fromTo(
        ".manifesto-belief",
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.5,
          ease: "none",
          scrollTrigger: { trigger: ".manifesto-list", start: "top 78%", end: "bottom 72%", scrub: true },
        },
      );
    }, root);
    return () => {
      ctx.revert();
      aboutScene.cohesion = 0;
      aboutScene.intensity = 0;
      aboutScene.explode = 0;
      aboutScene.finale = 0;
      aboutScene.plates.forEach((p) => (p.reveal = 0));
    };
  }, [r]);

  return (
    <div ref={root} className="about-root relative text-creme">
      <AboutSceneLayer />

      {/* ════════ ① HERO ════════ */}
      <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c0a0c]/40 via-transparent to-[#0c0a0c]/70" />
        <div ref={heroInner} className="relative z-10 mx-auto w-full max-w-[1500px] px-5 will-change-transform md:px-10">
          <p className="ah-eyebrow mb-7 font-sans text-[11px] uppercase tracking-[0.4em] text-pink md:text-xs">
            {a.hero.eyebrow}
          </p>
          <h1 className="font-display font-medium leading-[0.95] tracking-[-0.02em]">
            <span className="ah-line block overflow-hidden [perspective:600px]">
              <span className="block origin-bottom text-[10.5vw] md:text-[8vw] lg:text-[7vw]">{a.hero.line1}</span>
            </span>
            <span className="ah-line block overflow-hidden [perspective:600px]">
              <span className="block origin-bottom text-[10.5vw] italic text-pink md:text-[8vw] lg:text-[7vw]">
                {a.hero.line2}
              </span>
            </span>
          </h1>
        </div>
        <div className="ah-scroll absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-creme/50">{a.hero.scroll}</span>
          <span className="relative h-12 w-px overflow-hidden bg-creme/15">
            <span className="motion-only absolute inset-x-0 top-0 h-4 w-px animate-[scrollLine_2s_ease-in-out_infinite] bg-pink" />
          </span>
        </div>
      </section>

      {/* ════════ ② THE NAME — particle illustration forms here ════════ */}
      <section id="about-name" className="relative flex min-h-[100svh] items-center overflow-hidden py-24 md:py-32">
        <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-12 px-5 md:grid-cols-2 md:px-10">
          <div className="rounded-[1.6rem] bg-[#0c0a0c]/45 p-7 backdrop-blur-md ring-1 ring-creme/10 md:p-10">
            <Reveal>
              <span className="mb-8 block text-pink"><Kicker>{a.name.kicker}</Kicker></span>
            </Reveal>
            <Reveal as="h2" y={30} className="font-display text-4xl font-medium italic leading-[1.05] tracking-[-0.01em] sm:text-5xl">
              {a.name.heading}
            </Reveal>
            <div className="mt-8 space-y-4 font-sans text-base leading-relaxed text-creme/75 md:text-lg">
              {a.name.paras.map((p, i) => (
                <Reveal as="p" key={i} delay={i * 0.05} blur={false} y={20}>{p}</Reveal>
              ))}
            </div>
            <Reveal as="blockquote" className="mt-8 border-l-2 border-pink pl-5">
              <p className="font-display text-xl italic leading-snug md:text-2xl">“{a.name.quote}”</p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-creme/55">{a.name.quoteSub}</p>
            </Reveal>
            <Reveal as="p" className="mt-8 font-display text-2xl text-pink">{a.name.close}</Reveal>
          </div>

          {/* Right column: particles form the illustration here. Static fallback
              only when there is no canvas (reduced-motion / low-tier). */}
          <div className="relative flex min-h-[40vh] items-center justify-center">
            {staticIllo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/about/illustration.png"
                alt={a.name.illoAlt}
                className="max-h-[70vh] w-auto opacity-90 mix-blend-screen"
              />
            ) : (
              <span className="pointer-events-none select-none font-sans text-[10px] uppercase tracking-[0.3em] text-creme/25">
                {/* particles render in the world behind */}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ════════ ③ WHY US — plate flies in on the right ════════ */}
      <section id="about-why" className="relative overflow-hidden py-28 md:py-40">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a0c]/85 via-[#0c0a0c]/45 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal><span className="mb-9 block text-pink"><Kicker>{a.why.kicker}</Kicker></span></Reveal>
          <Reveal as="h2" y={30} className="max-w-3xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-6xl lg:text-7xl">
            {a.why.heading}
          </Reveal>
          <div className="mt-14 max-w-xl space-y-5 font-sans text-lg leading-relaxed text-creme/70 md:text-xl">
            {a.why.lines.map((l, i) => (
              <Reveal as="p" key={i} delay={i * 0.04} blur={false} y={20}>{l}</Reveal>
            ))}
          </div>
          <div className="mt-12 flex max-w-xl flex-col gap-6">
            <Reveal as="p" className="font-display text-3xl leading-tight md:text-4xl">{a.why.punchA}</Reveal>
            <Reveal as="p" className="font-display text-3xl leading-tight md:text-4xl">{a.why.punchB}</Reveal>
          </div>
          <Reveal as="p" className="mt-16 max-w-3xl font-display text-3xl italic leading-tight text-pink sm:text-4xl md:text-5xl">
            {a.why.close}
          </Reveal>
        </div>
      </section>

      {/* ════════ ④ PSYCHOLOGY — minimal, world breathes ════════ */}
      <section id="about-psych" className="relative overflow-hidden py-32 md:py-48">
        <div className="relative mx-auto max-w-[1100px] px-5 text-center md:px-10">
          <Reveal><span className="mb-10 inline-block text-pink"><Kicker>{a.psychology.kicker}</Kicker></span></Reveal>
          <Reveal as="h2" y={30} className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] sm:text-5xl md:text-6xl">
            {a.psychology.heading}
          </Reveal>
          <Reveal as="p" className="mx-auto mt-9 max-w-2xl font-sans text-lg leading-relaxed text-creme/70 md:text-xl">
            {a.psychology.body}
          </Reveal>
          <Reveal as="p" className="mt-9 font-display text-2xl italic md:text-3xl">{a.psychology.detail}</Reveal>
          <div className="mt-14 flex flex-col items-center gap-2">
            {a.psychology.nothing.map((n, i) => (
              <Reveal as="span" key={i} delay={i * 0.06} className="font-display text-2xl text-creme/35 md:text-3xl">{n}</Reveal>
            ))}
            <Reveal as="span" className="mt-5 font-display text-3xl font-medium text-pink md:text-4xl">{a.psychology.verdict}</Reveal>
          </div>
        </div>
      </section>

      {/* ════════ ⑤ THE BANDITAS — 3D tilt gallery ════════ */}
      <section id="about-team" className="relative overflow-hidden py-28 md:py-40">
        <div className="absolute inset-0 bg-[#0c0a0c]/60" />
        <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
          <Reveal><span className="mb-9 block text-pink"><Kicker>{a.team.kicker}</Kicker></span></Reveal>
          <div className="grid items-end gap-8 md:grid-cols-12">
            <Reveal as="h2" y={30} className="font-display text-4xl font-medium leading-[1.06] tracking-[-0.01em] sm:text-5xl md:col-span-7 md:text-6xl">
              {a.team.heading}
            </Reveal>
            <Reveal as="p" className="font-sans text-base leading-relaxed text-creme/65 md:col-span-5 md:text-lg">
              {a.team.intro}
            </Reveal>
          </div>

          <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {a.team.members.map((m, i) => {
              const slug = ["pia-alice", "dino", "niddl", "noemi-santo"][i] ?? "";
              return (
                <Reveal key={m.name} delay={i * 0.06}>
                  <TiltCard disabled={r} className="group">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] ring-1 ring-creme/15">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/about/team/${slug}.jpg`}
                        alt={`${m.name} — ${m.role}`}
                        loading="lazy"
                        className="h-full w-full object-cover grayscale transition-all duration-700 [transform:translateZ(0)] group-hover:grayscale-0 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a0c]/70 via-transparent to-transparent" />
                    </div>
                  </TiltCard>
                  <h3 className="mt-5 font-display text-2xl font-medium leading-tight">{m.name}</h3>
                  <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.2em] text-pink">{m.role}</p>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-creme/60">{m.craft}</p>
                </Reveal>
              );
            })}
          </div>
          <Reveal as="p" className="mt-14 font-display text-xl italic text-creme/45 md:text-2xl">{a.team.note}</Reveal>
        </div>
      </section>

      {/* ════════ ⑥ WHAT WE DO — kinetic marquee ════════ */}
      <section id="about-services" className="relative overflow-hidden py-28 md:py-40">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a0c]/80 via-[#0c0a0c]/40 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
          <Reveal><span className="mb-9 block text-pink"><Kicker>{a.services.kicker}</Kicker></span></Reveal>
          <Reveal as="h2" y={30} className="max-w-3xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.01em] sm:text-5xl md:text-6xl">
            {a.services.heading}
          </Reveal>
        </div>

        {/* full-bleed running services */}
        <div className="relative mt-14 overflow-hidden py-3" aria-hidden>
          <div className={`marquee-track ${r ? "" : "animate-[marquee-left_38s_linear_infinite]"}`}>
            {[0, 1].map((dup) => (
              <span key={dup} className="flex shrink-0 items-center">
                {a.services.items.map((s) => (
                  <span key={s} className="flex items-center font-display text-3xl text-creme/45 md:text-5xl">
                    <span className="px-6">{s}</span>
                    <span className="text-pink/50">✕</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-[1400px] px-5 md:px-10">
          <div className="flex flex-col gap-1">
            <Reveal as="span" className="font-display text-5xl font-medium leading-none tracking-[-0.02em] sm:text-6xl md:text-7xl">
              {a.services.everything}
            </Reveal>
            <div className="flex gap-6">
              <Reveal as="span" delay={0.06} className="font-display text-5xl font-medium leading-none tracking-[-0.02em] text-creme/30 sm:text-6xl md:text-7xl">
                {a.services.online}
              </Reveal>
              <Reveal as="span" delay={0.12} className="font-display text-5xl font-medium leading-none tracking-[-0.02em] text-creme/30 sm:text-6xl md:text-7xl">
                {a.services.offline}
              </Reveal>
            </div>
          </div>
          <Reveal as="p" className="mt-12 font-display text-2xl italic text-pink md:text-3xl">{a.services.close}</Reveal>
        </div>
      </section>

      {/* ════════ Focal campaign moment — the big centred plate develops here ════════ */}
      {!r && (
        <section id="about-work-focal" className="relative flex min-h-[95svh] items-center overflow-hidden py-24">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a0c]/85 via-[#0c0a0c]/35 to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-10">
            <Reveal><span className="mb-8 block text-pink"><Kicker>{a.work.kicker}</Kicker></span></Reveal>
            <Reveal as="h2" y={30} className="max-w-xl font-display text-5xl font-medium leading-[1.02] tracking-[-0.01em] sm:text-6xl md:text-7xl">
              {a.work.heading}
            </Reveal>
          </div>
        </section>
      )}

      {/* Campaign plates live in the 3D world (CampaignPlates). For reduced-motion
          users there is no canvas, so present them here as a clean DOM gallery. */}
      {r && (
        <section className="relative overflow-hidden py-24">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <span className="mb-8 block text-pink">
              <Kicker>{a.work.kicker}</Kicker>
            </span>
            <h2 className="mb-12 max-w-2xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] sm:text-5xl">
              {a.work.heading}
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {a.work.items.map((it, i) => (
                <figure key={i} className="overflow-hidden rounded-[1.1rem] ring-1 ring-creme/12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/about/work/campaign-0${i + 1}.jpg`} alt={it.alt} className="w-full" />
                  <figcaption className="px-1 pt-3 font-sans text-[11px] uppercase tracking-[0.2em] text-creme/55">
                    {it.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ ⑦ VIENNA — full-bleed atmosphere ════════ */}
      <section className="relative flex min-h-[80svh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about/pia-vineyard.jpg"
          alt={a.vienna.imageAlt}
          className={`absolute inset-0 h-full w-full object-cover ${r ? "" : "kenburns"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a0c] via-[#0c0a0c]/40 to-[#0c0a0c]/55" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-[10vh] md:px-10">
          <Reveal><span className="mb-7 block text-creme/70"><Kicker>{a.vienna.kicker}</Kicker></span></Reveal>
          <Reveal as="h2" y={30} className="max-w-4xl font-display text-4xl font-medium leading-[1.0] tracking-[-0.01em] sm:text-6xl md:text-7xl">
            {a.vienna.heading}
          </Reveal>
          <Reveal as="p" className="mt-8 max-w-xl font-sans text-base leading-relaxed text-creme/75 md:text-lg">
            {a.vienna.body}
          </Reveal>
        </div>
      </section>

      {/* ════════ ⑧ THE MANIFESTO — cinematic peak ════════ */}
      <section id="about-manifesto" className="relative overflow-hidden py-32 md:py-52">
        <div className="relative mx-auto max-w-[1300px] px-5 md:px-10">
          <Reveal><span className="mb-12 block text-pink"><Kicker>{a.manifesto.kicker}</Kicker></span></Reveal>
          <div className="manifesto-list space-y-3 font-display text-3xl font-medium leading-[1.12] tracking-[-0.01em] sm:text-4xl md:text-5xl lg:text-6xl">
            {a.manifesto.beliefs.map((b, i) => (
              <p key={i} className="manifesto-belief">{b}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ⑨ FINAL — wordmark re-forms in light ════════ */}
      <section id="about-final" className="relative flex min-h-[92svh] items-center overflow-hidden py-28 md:py-40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 50% at 50% 60%, rgba(251,0,63,0.16), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1300px] px-5 text-center md:px-10">
          <Reveal as="h2" className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] sm:text-5xl md:text-7xl">
            {a.final.line1}
            <br />
            <span className="italic text-pink">{a.final.line2}</span>
          </Reveal>
          <Reveal>
            <div className="mt-12 flex flex-col items-center gap-5">
              <MagneticButton
                onClick={() => scrollToId("contact")}
                as="a"
                href={`/${lang}#contact`}
                strength={0.5}
                className="rounded-full bg-pink px-10 py-5 font-sans text-sm uppercase tracking-[0.14em] text-creme transition-colors hover:bg-creme hover:text-ink"
              >
                {a.final.cta}
              </MagneticButton>
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-creme/55">{a.final.note}</span>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
