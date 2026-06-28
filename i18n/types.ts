export interface Dictionary {
  meta: {
    title: string;
    description: string;
    ogAlt: string;
  };
  loader: {
    line1: string;
    line2: string;
    enter: string;
    skip: string;
  };
  nav: {
    home: string;
    about: string;
    services: string;
    portfolio: string;
    journal: string;
    contact: string;
    soon: string;
    menu: string;
    close: string;
    cta: string;
  };
  hero: {
    eyebrow: string;
    line1: string;
    line2: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scroll: string;
  };
  manifesto: {
    eyebrow: string;
    heading: string;
    body: string;
    signature: string;
  };
  capabilities: {
    eyebrow: string;
    heading: string;
    headingAccent: string;
    items: string[];
    body: string;
  };
  philosophy: {
    eyebrow: string;
    heading: string;
    body: string;
    stats: { value: string; label: string }[];
  };
  work: {
    eyebrow: string;
    line: string;
    altFood1: string;
    altFood2: string;
  };
  cta: {
    eyebrow: string;
    heading: string;
    body: string;
    button: string;
    note: string;
  };
  footer: {
    tagline: string;
    rights: string;
    based: string;
    phaseNote: string;
  };
}
