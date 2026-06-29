import { i18n, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Capabilities from "@/components/sections/Capabilities";
import Philosophy from "@/components/sections/Philosophy";
import EditorialShowcase from "@/components/sections/EditorialShowcase";
import ContactCTA from "@/components/sections/ContactCTA";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default function HomePage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : i18n.defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <Hero dict={dict} />
      <Manifesto dict={dict} />
      <Capabilities dict={dict} />
      <Philosophy dict={dict} />
      <EditorialShowcase dict={dict} />
      <ContactCTA dict={dict} />
    </>
  );
}
