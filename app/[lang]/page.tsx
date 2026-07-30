import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Capabilities from "@/components/sections/Capabilities";
import ReelsShowcase from "@/components/sections/ReelsShowcase";
import Philosophy from "@/components/sections/Philosophy";
import EditorialShowcase from "@/components/sections/EditorialShowcase";
import ContactCTA from "@/components/sections/ContactCTA";
import OfferBand from "@/components/OfferBand";
import InlineCTA from "@/components/InlineCTA";
import StarterPackages from "@/components/home/StarterPackages";
import NewsletterPromo from "@/components/home/NewsletterPromo";
import SocialSection from "@/components/home/SocialSection";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default function HomePage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <Hero dict={dict} lang={lang} />
      <StarterPackages lang={lang} />
      <Manifesto dict={dict} />
      <Capabilities dict={dict} />
      <InlineCTA
        lang={lang}
        de="Genau das braucht deine Marke? Sag uns, was du vorhast."
        en="Exactly what your brand needs? Tell us what you're planning."
      />
      <ReelsShowcase lang={lang} />
      <InlineCTA
        lang={lang}
        de="Willst du Content, der so hängen bleibt? Preis auf Anfrage — unverbindlich."
        en="Want content that sticks like this? Price on request — non-binding."
        buttonDe="Content anfragen"
        buttonEn="Request content"
        prefill="social"
      />
      <Philosophy dict={dict} />
      <OfferBand lang={lang} tone="ink" />
      <EditorialShowcase dict={dict} />
      <NewsletterPromo lang={lang} />
      <ContactCTA dict={dict} lang={lang} />
      <SocialSection lang={lang} />
    </>
  );
}
