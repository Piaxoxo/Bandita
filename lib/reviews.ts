/*
  Customer reviews, as written by the customers.

  Source: the agency's Facebook page (see SOCIAL_LINKS). Every entry here is a
  real review copied verbatim — name as displayed, text untouched, date as
  shown. Nothing is paraphrased, translated or invented; a review written in
  German stays German on the English page, marked with its language.

  Empty list = the chapter does not render. Add reviews only from the page.
*/

export type Review = {
  name: string;
  text: string;
  lang: "de" | "en";
  /** as displayed on Facebook, e.g. "März 2026" */
  date?: string;
};

export const REVIEWS: Review[] = [];

/** the Facebook recommendations count / rating, only if shown on the page */
export const REVIEW_SUMMARY: { rating?: number; count?: number } = {};
