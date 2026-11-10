import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Cover from "@/components/editorial/Cover";
import PhotoSpread from "@/components/editorial/PhotoSpread";
import CocktailSeries from "@/components/sections/CocktailSeries";
import SelectedWork from "@/components/home/SelectedWork";
import Manifesto from "@/components/sections/Manifesto";
import Founder from "@/components/sections/Founder";
import Capabilities from "@/components/sections/Capabilities";
import Voices from "@/components/sections/Voices";
import ContactCTA from "@/components/sections/ContactCTA";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

/*
  One issue, nine chapters, numbered the way the brand guide numbers itself:

    01  Titel            → Cover          the film, the glass band, the line
    02  Am Set           → PhotoSpread    photographs from the work itself
    03  Serie            → CocktailSeries four glasses on four colours, pinned
    04  Arbeiten         → SelectedWork   six projects on ink
    05  Haltung          → Manifesto      one sentence
    06  Wer dahintersteht→ Founder        the founder, the team
    07  Leistungen       → Capabilities   the constellation
    08  Was Kunden sagen → Voices         Facebook reviews, verbatim (renders only with entries)
    09  Kontakt          → ContactCTA     the pink spread

  The page behind alternates ink and paper (see SceneLayer); the ribbon runs
  the length of it.
*/

// The agency's own photographs. Captions name only what the picture shows
// and what the agency said about it; no places or dates are guessed.
const SET_PHOTOS = [
  {
    src: "/editorial/set-dreh.jpg",
    alt: { de: "Dreh mit Kinokamera — Blick auf den Monitor der Blackmagic", en: "Shooting on a cinema camera — the Blackmagic monitor" },
    caption: { de: "Dreh · Kinokamera", en: "Shoot · cinema camera" },
    aspect: "3/2" as const,
  },
  {
    src: "/editorial/set-messe-rowa.jpg",
    alt: { de: "Pia-Alice Stelzl am Messestand von ROWA, mit orangen Ballons und einem Kind", en: "Pia-Alice Stelzl at the ROWA trade-fair stand, with orange balloons and a child" },
    caption: { de: "Messe-Support & Social-Media-Content für ROWA", en: "Trade-fair support & social content for ROWA" },
    aspect: "4/5" as const,
    position: "top" as const,
  },
  {
    src: "/editorial/set-rig.jpg",
    alt: { de: "Kinokamera am Set — Blackmagic 6K mit Holzgriff und XLR-Kabel", en: "Cinema camera on set — Blackmagic 6K with wooden grip and XLR cable" },
    caption: { de: "Am Set · Blackmagic 6K", en: "On set · Blackmagic 6K" },
    aspect: "3/2" as const,
  },
  {
    src: "/editorial/reel-happy-place.jpg",
    alt: { de: "Standbild aus einem Reel — Felsen, Gras, blauer Himmel, Schriftzug My Happy Place", en: "Still from a reel — rocks, grass, blue sky, the words My Happy Place" },
    caption: { de: "Reel-Still · My Happy Place", en: "Reel still · My Happy Place" },
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
      <CocktailSeries lang={lang} />
      <SelectedWork lang={lang} />
      <Manifesto dict={dict} />
      <Founder dict={dict} lang={lang} />
      <Capabilities dict={dict} />
      <Voices lang={lang} />
      <ContactCTA dict={dict} lang={lang} />
    </>
  );
}
