"use client";

import Image from "next/image";
import type { Locale } from "@/i18n/config";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import Chapter, { type ChapterNo } from "./Chapter";

/*
  A photo spread, the way a magazine lays pictures on a page: not a grid of
  equal tiles but an asymmetric composition — one picture leads, the others
  sit offset against it, each with a caption in small caps, each moving at
  its own parallax speed so the page has depth.

  It takes any number of photographs. Two make the classic spread (large
  left, smaller right, dropped); three and more fall into alternating
  offsets. New deliveries slot in as new entries, or as a second spread.
*/

type Bi = { de: string; en: string };
export type Photo = {
  src: string;
  alt: Bi;
  caption: Bi;
  /** how the frame crops it; the file's own ratio is irrelevant here */
  aspect?: "3/2" | "4/5" | "1/1" | "16/10";
  /** where the crop anchors — "top" keeps a face in a tall frame */
  position?: "center" | "top" | "bottom";
};

const POSITION: Record<NonNullable<Photo["position"]>, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
};

const ASPECT: Record<NonNullable<Photo["aspect"]>, string> = {
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "16/10": "aspect-[16/10]",
};

function Frame({ photo, lang, speed, sizes, priority = false }: { photo: Photo; lang: Locale; speed: number; sizes: string; priority?: boolean }) {
  return (
    <figure>
      <Parallax speed={speed}>
        <div className={`relative overflow-hidden bg-ink/5 ${ASPECT[photo.aspect ?? "3/2"]}`}>
          <Image
            src={photo.src}
            alt={photo.alt[lang]}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover ${POSITION[photo.position ?? "center"]}`}
          />
        </div>
      </Parallax>
      <figcaption className="mt-3 font-sans text-[10px] uppercase tracking-[0.3em] text-ink/50">
        {photo.caption[lang]}
      </figcaption>
    </figure>
  );
}

export default function PhotoSpread({
  n,
  title,
  line,
  photos,
  lang,
}: {
  n: ChapterNo;
  title: Bi;
  /** one line of type set into the spread, optional */
  line?: Bi;
  photos: Photo[];
  lang: Locale;
}) {
  if (!photos.length) return null;
  const [lead, ...rest] = photos;

  return (
    <section data-tone="paper" className="relative px-5 pb-20 pt-16 text-ink md:px-10 md:pb-28 md:pt-24">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <Chapter n={n} title={title[lang]} />
        </Reveal>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-8">
          {/* the lead picture */}
          <Reveal className="md:col-span-7">
            <Frame photo={lead} lang={lang} speed={-24} sizes="(min-width: 768px) 58vw, 100vw" />
          </Reveal>

          {/* the rest, dropped and offset against it */}
          <div className="md:col-span-4 md:col-start-9 md:mt-28">
            {rest.slice(0, 1).map((p) => (
              <Reveal key={p.src} delay={0.1}>
                <Frame photo={{ ...p, aspect: p.aspect ?? "4/5" }} lang={lang} speed={-48} sizes="(min-width: 768px) 32vw, 100vw" />
              </Reveal>
            ))}
            {line && (
              <Reveal delay={0.2}>
                <p className="mt-10 max-w-xs font-display text-2xl leading-snug text-ink md:text-3xl">
                  {line[lang]}
                </p>
              </Reveal>
            )}
          </div>
        </div>

        {/* further pictures, two to a row, alternating weight */}
        {rest.length > 1 && (
          <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-8">
            {rest.slice(1).map((p, i) => (
              <Reveal
                key={p.src}
                delay={(i % 2) * 0.1}
                className={i % 2 === 0 ? "md:col-span-5 md:col-start-2" : "md:col-span-5 md:col-start-8 md:mt-20"}
              >
                <Frame photo={p} lang={lang} speed={i % 2 === 0 ? -20 : -40} sizes="(min-width: 768px) 42vw, 100vw" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
