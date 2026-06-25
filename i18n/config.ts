export const i18n = {
  defaultLocale: "en",
  locales: ["en", "de"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export function isLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}
