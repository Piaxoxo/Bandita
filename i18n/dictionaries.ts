import type { Locale } from "./config";
import type { Dictionary } from "./types";
import en from "./dictionaries/en";
import de from "./dictionaries/de";

const dictionaries: Record<Locale, Dictionary> = { en, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
