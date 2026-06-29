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
  showcase: {
    s1: { heading: string; sub: string; label: string; alt: string };
    s2: { heading: string; sub: string; label: string; alt: string; altSmall: string };
    s3: { heading: string; sub: string; label: string; alt: string };
    s4: { heading: string; sub: string; label: string; alt: string };
  };
  about: {
    meta: { title: string; description: string };
    hero: {
      eyebrow: string;
      line1: string;
      line2: string;
      scroll: string;
    };
    name: {
      kicker: string;
      heading: string;
      paras: string[];
      quote: string;
      quoteSub: string;
      close: string;
      illoAlt: string;
    };
    why: {
      kicker: string;
      heading: string;
      lines: string[];
      punchA: string;
      punchB: string;
      close: string;
    };
    psychology: {
      kicker: string;
      heading: string;
      body: string;
      detail: string;
      nothing: string[];
      verdict: string;
    };
    team: {
      kicker: string;
      heading: string;
      intro: string;
      members: { name: string; role: string; craft: string }[];
      note: string;
      imageAlt: string;
    };
    services: {
      kicker: string;
      heading: string;
      items: string[];
      everything: string;
      online: string;
      offline: string;
      close: string;
    };
    vienna: {
      kicker: string;
      heading: string;
      body: string;
      imageAlt: string;
    };
    work: {
      kicker: string;
      heading: string;
      items: { caption: string; alt: string }[];
    };
    manifesto: {
      kicker: string;
      heading: string;
      beliefs: string[];
    };
    final: {
      line1: string;
      line2: string;
      cta: string;
      note: string;
    };
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
