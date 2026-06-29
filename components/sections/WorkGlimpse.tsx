"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/i18n/types";
import Reveal from "@/components/anim/Reveal";
import { useSite } from "@/lib/site-context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Anim = "tilt3d" | "clipDown" | "clipRight" | "rise";

const PHOTOS = ["/work/film-01.jpg", "/work/food-01.jpg", "/work/food-02.jpg", "/work/film-02.jpg"];

function GalleryItem({
  src,
  alt,
  anim,
  className,
  heightClass,
  reduced,
}: {
  src: string;
  alt: string;
  anim: Anim;
  className: string;
  heightClass: string;
  reduced: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const fig = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;
    const w = wrap.current;
    const f = fig.current;
    if (!w || !f) return;
    const ctx = gsap.context(() => {
      if (anim === "tilt3d") {
        gsap.fromTo(
          w,
          { rotateY: -16, y: 70, z: -120, opacity: 0.5 },
          {
            rotateY: 8, y: -50, z: 0, opacity: 1, ease: "none",
            scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );
      } else if (anim === "clipDown") {
        gsap.fromTo(
          f,
          { clipPath: "inset(0% 0% 100% 0% round 1.8rem)", scale: 1.14 },
          {
            clipPath: "inset(0% 0% 0% 0% round 1.8rem)", scale: 1, duration: 1.3, ease: "expo.out",
            scrollTrigger: { trigger: w, start: "top 82%" },
          },
        );
      } else if (anim === "clipRight") {
        gsap.fromTo(
          f,
          { clipPath: "inset(0% 100% 0% 0% round 1.8rem)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 1.8rem)", duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: w, start: "top 82%" },
          },
        );
      } else {
        gsap.fromTo(
          w,
          { y: 120, opacity: 0, filter: "blur(12px)" },
          {
            y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: w, start: "top 86%" },
          },
        );
      }
    }, w);
    return () => ctx.revert();
  }, [anim, reduced]);

  return (
    <div
      ref={wrap}
      className={`${className} will-change-transform`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <figure
        ref={fig as React.RefObject<HTMLElement>}
        className="overflow-hidden rounded-[1.8rem] shadow-2xl ring-1 ring-creme/10"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full object-cover ${heightClass} ${reduced ? "" : "kenburns"}`}
        />
      </figure>
    </div>
  );
}

// Cinematic "selected frames" gallery — each photo gets a different animation.
// Renders only once the real reference photos exist in /public/work.
export default function WorkGlimpse({ dict }: { dict: Dictionary }) {
  const [ready, setReady] = useState(false);
  const { reducedMotion } = useSite();

  useEffect(() => {
    let alive = true;
    const load = (src: string) =>
      new Promise<boolean>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
    Promise.all(PHOTOS.map(load)).then((res) => {
      if (alive && res.every(Boolean)) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return null;

  return (
    <section
      id="work"
      className="relative overflow-hidden bg-ink py-28 text-creme md:py-40"
      style={{ perspective: "1500px" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(55% 55% at 28% 26%, rgba(255,157,184,0.16), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <Reveal>
          <p className="mb-12 font-sans text-[11px] uppercase tracking-[0.4em] text-rose">
            {dict.work.eyebrow}
          </p>
        </Reveal>

        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8"
          style={{ transformStyle: "preserve-3d" }}
        >
          <GalleryItem
            src="/work/film-01.jpg"
            alt={dict.work.altFilm1}
            anim="tilt3d"
            className="md:col-span-8"
            heightClass="h-[46vh] md:h-[68vh]"
            reduced={reducedMotion}
          />
          <GalleryItem
            src="/work/food-01.jpg"
            alt={dict.work.altFood1}
            anim="clipDown"
            className="md:col-span-4 md:mt-20"
            heightClass="h-[34vh] md:h-[68vh]"
            reduced={reducedMotion}
          />

          <div className="md:col-span-5">
            <GalleryItem
              src="/work/food-02.jpg"
              alt={dict.work.altFood2}
              anim="rise"
              className=""
              heightClass="h-[32vh] md:h-[44vh]"
              reduced={reducedMotion}
            />
            <Reveal>
              <p className="mt-8 max-w-sm font-display text-2xl leading-snug text-creme/90 md:text-3xl">
                {dict.work.line}
              </p>
            </Reveal>
          </div>

          <GalleryItem
            src="/work/film-02.jpg"
            alt={dict.work.altFilm2}
            anim="clipRight"
            className="md:col-span-7 md:-mt-8"
            heightClass="h-[40vh] md:h-[54vh]"
            reduced={reducedMotion}
          />
        </div>
      </div>
    </section>
  );
}
