import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Cover from "@/components/editorial/Cover";
import SelectedWork from "@/components/home/SelectedWork";
import Manifesto from "@/components/sections/Manifesto";
import Capabilities from "@/components/sections/Capabilities";
import ContactCTA from "@/components/sections/ContactCTA";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

/*
  One issue, five chapters, numbered the way the brand guide numbers itself:

    01  Titel       → Cover        masthead, the line, one image
    02  Arbeiten    → SelectedWork six projects on paper
    03  Haltung     → Manifesto    one sentence
    04  Leistungen  → Capabilities the constellation
    05  Kontakt     → ContactCTA   the pink spread

  Paper throughout, the ribbon running the length of it; the only full-colour
  spread is the last one, where the page stops showing and asks.
*/
export default function HomePage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <Cover dict={dict} lang={lang} />
      <SelectedWork lang={lang} />
      <Manifesto dict={dict} />
      <Capabilities dict={dict} />
      <ContactCTA dict={dict} lang={lang} />
    </>
  );
}
