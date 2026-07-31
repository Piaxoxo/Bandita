// FAQ content for the "Marketing Agentur Wien" landing page.
// Plain module (no "use client") so the server component can build the
// FAQPage JSON-LD from the exact same source the page renders.

export type FaqItem = { q: string; a: string };

export const FAQ: Record<"de" | "en", FaqItem[]> = {
  de: [
    {
      q: "Was kostet eine Marketingagentur in Wien?",
      a: "Ehrlich: Das kommt darauf an, was du brauchst. Bei uns startet eine Website ab 2.990 €, laufende Social-Media-Betreuung ab 890 € im Monat und SEO ab 990 €. Alles darüber kalkulieren wir individuell — du bekommst vorab ein transparentes Angebot, unverbindlich und ohne Kleingedrucktes.",
    },
    {
      q: "Was macht Bandita anders als andere Werbeagenturen in Wien?",
      a: "Wir raten nicht, wir wissen. Jede Farbe, jeder Schnitt, jedes Wort basiert auf Neuromarketing und Wirtschaftspsychologie statt auf Geschmack. Dazu kommt: Strategie, Branding, Film, Fotografie, Web und KI liegen bei uns unter einem Dach — du brauchst keine fünf Dienstleister, die sich gegenseitig erklären müssen.",
    },
    {
      q: "Arbeitet ihr nur mit Kunden aus Wien?",
      a: "Unsere Adresse ist Wien, unsere Kunden sind es nicht immer. Wir produzieren regelmäßig international — von Nordmazedonien bis Portugal. Persönliche Termine in Wien und Umgebung sind jederzeit möglich, alles andere läuft remote genauso gut.",
    },
    {
      q: "Wie schnell kann ein Projekt starten?",
      a: "Auf jede Anfrage antworten wir innerhalb von 48 Stunden. Nach dem Erstgespräch steht dein Angebot meist innerhalb weniger Tage. Kleinere Projekte starten oft noch in derselben Woche, größere Produktionen planen wir mit ein bis zwei Wochen Vorlauf.",
    },
    {
      q: "Übernehmt ihr auch nur einzelne Leistungen?",
      a: "Ja. Du kannst mit einem einzelnen Reel-Set, einer Website oder einem SEO-Audit starten — oder uns gleich als komplette externe Marketingabteilung buchen. Beides ist möglich, wir drängen dir nichts auf.",
    },
  ],
  en: [
    {
      q: "What does a marketing agency in Vienna cost?",
      a: "Honestly: it depends on what you need. With us a website starts at €2,990, ongoing social media from €890 per month and SEO from €990. Anything beyond that is calculated individually — you get a transparent, non-binding offer up front.",
    },
    {
      q: "What makes Bandita different from other agencies in Vienna?",
      a: "We don't guess, we know. Every colour, cut and word is based on neuromarketing and business psychology instead of taste. On top of that, strategy, branding, film, photography, web and AI all live under one roof — no five suppliers explaining themselves to each other.",
    },
    {
      q: "Do you only work with clients from Vienna?",
      a: "Our address is Vienna, our clients aren't always. We produce internationally on a regular basis — from North Macedonia to Portugal. In-person meetings in and around Vienna are always possible, everything else works just as well remotely.",
    },
    {
      q: "How quickly can a project start?",
      a: "We reply to every enquiry within 48 hours. After the first call your offer usually follows within a few days. Smaller projects often start the same week; larger productions we plan one to two weeks ahead.",
    },
    {
      q: "Do you also take on single services?",
      a: "Yes. You can start with one reel set, a website or an SEO audit — or book us as your complete external marketing department. Both work, and we won't push you.",
    },
  ],
};
