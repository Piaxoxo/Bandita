"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/types";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";

const FOOD_1 = "/work/food-01.jpg";
const FOOD_2 = "/work/food-02.jpg";

// A short cinematic "selected frames" moment. Renders only once the real
// reference photos exist in /public/work — keeps the build clean meanwhile.
export default function WorkGlimpse({ dict }: { dict: Dictionary }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = (src: string) =>
      new Promise<boolean>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
    Promise.all([load(FOOD_1), load(FOOD_2)]).then(([a, b]) => {
      if (alive && a && b) setReady(true);
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
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 30%, rgba(251,0,63,0.25), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <Reveal>
          <p className="mb-12 font-sans text-[11px] uppercase tracking-[0.4em] text-rose">
            {dict.work.eyebrow}
          </p>
        </Reveal>

        <div className="grid items-center gap-6 md:grid-cols-12 md:gap-10">
          <Parallax speed={-50} className="md:col-span-7">
            <Reveal>
              <figure className="overflow-hidden rounded-[1.6rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={FOOD_1}
                  alt={dict.work.altFood1}
                  loading="lazy"
                  className="h-[44vh] w-full object-cover md:h-[64vh]"
                />
              </figure>
            </Reveal>
          </Parallax>

          <div className="md:col-span-5">
            <Parallax speed={40}>
              <Reveal>
                <figure className="overflow-hidden rounded-[1.6rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={FOOD_2}
                    alt={dict.work.altFood2}
                    loading="lazy"
                    className="h-[32vh] w-full object-cover md:h-[44vh]"
                  />
                </figure>
              </Reveal>
            </Parallax>

            <Reveal>
              <p className="mt-8 max-w-sm font-display text-2xl leading-snug text-creme/90 md:text-3xl">
                {dict.work.line}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
