import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Cover from "@/components/editorial/Cover";
import PhotoSpread from "@/components/editorial/PhotoSpread";
import SelectedWork from "@/components/home/SelectedWork";
import Manifesto from "@/components/sections/Manifesto";
import Capabilities from "@/components/sections/Capabilities";
import ContactCTA from "@/components/sections/ContactCTA";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

/*
  One issue, six chapters, numbered the way the brand guide numbers itself:

    01  Titel       → Cover        masthead, the line, the film window
    02  Am Set      → PhotoSpread  photographs from the work itself
    03  Arbeiten    → SelectedWork six projects on paper
    04  Haltung     → Manifesto    one sentence
    05  Leistungen  → Capabilities the constellation
    06  Kontakt     → ContactCTA   the pink spread

  Paper throughout, the ribbon running the length of it; the only full-colour
  spread is the last one, where the page stops showing and asks.
*/

// The agency's own photographs, as they arrive. Captions name only what the
// picture shows; no places or dates are guessed.
//
// Stand-ins for now: the two film-set stills already in the repo. The
// photographs sent for this chapter (Blackmagic rig, the shoot, the trade
// fair for ROWA) reached the conversation as previews only, not as files,
// and are swapped in the moment they land on disk.
const SET_PHOTOS = [
  {
    src: "/work/film-01.jpg",
    alt: { de: "Filmproduktion — am Set", en: "Film production — on set" },
    caption: { de: "Am Set", en: "On set" },
    aspect: "3/2" as const,
  },
  {
    src: "/work/film-02.jpg",
    alt: { de: "Filmproduktion — Kinokamera", en: "Film production — cinema camera" },
    caption: { de: "Dreh", en: "Shoot" },
    aspect: "4/5" as const,
  },
];

export default function HomePage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <Cover dict={dict} lang={lang} />
      <PhotoSpread
        n="02"
        title={{ de: "Am Set", en: "On set" }}
        line={{ de: "Kinokamera. Nicht weil's teurer ist. Weil man's sieht.", en: "Cinema camera. Not because it costs more. Because you can see it." }}
        photos={SET_PHOTOS}
        lang={lang}
      />
      <SelectedWork lang={lang} />
      <Manifesto dict={dict} />
      <Capabilities dict={dict} />
      <ContactCTA dict={dict} lang={lang} />
    </>
  );
}
