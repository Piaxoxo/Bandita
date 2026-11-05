import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/home/SelectedWork";
import Manifesto from "@/components/sections/Manifesto";
import Capabilities from "@/components/sections/Capabilities";
import ContactCTA from "@/components/sections/ContactCTA";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

/*
  Five screens. The previous homepage had thirteen blocks — packages, two
  inline offers, reels, philosophy, an offer band, editorial, newsletter,
  social — and around a thousand words. It explained the agency; it never
  showed the work.

  The order is the argument:
    a line        → Hero
    the work      → SelectedWork
    one sentence  → Manifesto
    the range     → Capabilities
    the ask       → ContactCTA

  Dark for the film and the work, creme from the sentence on: one turn of
  the light, placed where the page stops showing and starts talking.
*/
export default function HomePage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <Hero dict={dict} lang={lang} />
      <SelectedWork lang={lang} />
      <Manifesto dict={dict} />
      <Capabilities dict={dict} />
      <ContactCTA dict={dict} lang={lang} />
    </>
  );
}
