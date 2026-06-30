// "The Studio" — content for the 6 colour-rooms + hero/intro/cta.
// Bandita brand palette per department (full palette finally in use).

export type Bi = { en: string; de: string };

export type Room = {
  id: string;
  color: string; // brand accent flooding this room
  dark?: boolean; // text goes creme instead of ink (the cinema room)
  kicker: Bi; // "Collection 0X · …"
  title: Bi; // department name
  lines: Bi[]; // copy
  services: string[]; // department services (industry terms, kept as-is)
};

export const HERO = {
  title: "THE STUDIO",
  sub: {
    en: ["Everything your brand needs.", "Under one roof.", "No templates. No shortcuts. No ordinary."],
    de: ["Alles, was deine Marke braucht.", "Unter einem Dach.", "Keine Templates. Keine Abkürzungen. Nichts Gewöhnliches."],
  } as { en: string[]; de: string[] },
  button: { en: "Let's steal attention.", de: "Stehlen wir Aufmerksamkeit." } as Bi,
};

export const INTRO: Bi[] = [
  { en: "Most agencies sell services. We build brands.", de: "Die meisten Agenturen verkaufen Leistungen. Wir bauen Marken." },
  { en: "Marketing isn't a logo. It's not a website. It's not a reel.", de: "Marketing ist kein Logo. Keine Website. Kein Reel." },
  { en: "It's every single moment someone remembers your business.", de: "Es ist jeder Moment, in dem sich jemand an dein Business erinnert." },
  { en: "That's why we don't separate strategy, design, film, technology and storytelling.", de: "Deshalb trennen wir Strategie, Design, Film, Technologie und Storytelling nicht." },
  { en: "Everything works together. Everything belongs together.", de: "Alles arbeitet zusammen. Alles gehört zusammen." },
];

export const ROOMS: Room[] = [
  {
    id: "spark",
    color: "#FFC23D", // Gelb
    kicker: { en: "Collection 01 · For brands ready to exist.", de: "Collection 01 · Für Marken, die existieren wollen." },
    title: { en: "The Spark", de: "The Spark" },
    lines: [
      { en: "Every unforgettable brand starts with one thing. An idea.", de: "Jede unvergessliche Marke beginnt mit einem: einer Idee." },
      { en: "Then comes strategy. Identity. Voice. Character.", de: "Dann kommen Strategie. Identität. Stimme. Charakter." },
      { en: "People don't fall in love with logos. They fall in love with stories.", de: "Menschen verlieben sich nicht in Logos. Sie verlieben sich in Geschichten." },
    ],
    services: ["Brand Strategy", "Brand Positioning", "Brand Identity", "Logo Design", "Naming", "Creative Direction"],
  },
  {
    id: "heist",
    color: "#5FC9BC", // Teal
    kicker: { en: "Collection 02 · Ready to steal attention.", de: "Collection 02 · Bereit, Aufmerksamkeit zu stehlen." },
    title: { en: "The Heist", de: "The Heist" },
    lines: [
      { en: "Your website shouldn't explain your brand. It should make people feel it.", de: "Deine Website soll deine Marke nicht erklären. Sie soll sie fühlbar machen." },
      { en: "No templates. No builders. No shortcuts. Only experiences.", de: "Keine Templates. Keine Baukästen. Keine Abkürzungen. Nur Erlebnisse." },
    ],
    services: ["Premium Websites", "3D Websites", "Interactive Experiences", "UX / UI Design", "Landing Pages", "SEO Foundations"],
  },
  {
    id: "takeover",
    color: "#FF5C9E", // Rosé
    kicker: { en: "Collection 03 · Own the conversation.", de: "Collection 03 · Beherrsche das Gespräch." },
    title: { en: "The Takeover", de: "The Takeover" },
    lines: [
      { en: "Beautiful brands mean nothing if nobody sees them.", de: "Schöne Marken bedeuten nichts, wenn niemand sie sieht." },
      { en: "Ideas become campaigns. Campaigns become conversations. Conversations become customers.", de: "Ideen werden Kampagnen. Kampagnen werden Gespräche. Gespräche werden Kunden." },
    ],
    services: ["Social Media", "Content Production", "Performance Marketing", "Google Ads", "Meta Ads", "TikTok Ads"],
  },
  {
    id: "experience",
    color: "#1A1216", // Ink — the cinema room
    dark: true,
    kicker: { en: "Collection 04 · Marketing should feel like cinema.", de: "Collection 04 · Marketing sollte sich wie Kino anfühlen." },
    title: { en: "The Experience", de: "The Experience" },
    lines: [
      { en: "Anyone can record a video. We create emotions.", de: "Jeder kann ein Video aufnehmen. Wir erschaffen Emotionen." },
      { en: "People remember feelings. Not resolutions.", de: "Menschen erinnern sich an Gefühle. Nicht an Auflösungen." },
    ],
    services: ["Cinema Production", "Commercial Production", "Photography", "Drone Production", "Audio Production", "Event Marketing"],
  },
  {
    id: "vault",
    color: "#FF8A5B", // Coral
    kicker: { en: "Collection 05 · Everything else.", de: "Collection 05 · Alles andere." },
    title: { en: "The Vault", de: "The Vault" },
    lines: [
      { en: "The things that don't fit into categories.", de: "Die Dinge, die in keine Kategorie passen." },
      { en: "Usually the most exciting projects.", de: "Meistens die spannendsten Projekte." },
    ],
    services: ["Merchandise", "Print Design", "Packaging", "Creative Consulting", "AI Content"],
  },
  {
    id: "partnership",
    color: "#FB003F", // Pink — the merge / climax
    kicker: { en: "Collection 06 · Your creative department. Without hiring one.", de: "Collection 06 · Deine Kreativabteilung. Ohne sie einzustellen." },
    title: { en: "The Partnership", de: "The Partnership" },
    lines: [
      { en: "Designers. Developers. Filmmakers. Photographers. Strategists. Media buyers. Creative directors.", de: "Designer. Developer. Filmemacher. Fotografen. Strategen. Media-Buyer. Creative Directors." },
      { en: "Working as part of your company.", de: "Als Teil deines Unternehmens." },
      { en: "That's Bandita.", de: "Das ist Bandita." },
    ],
    services: [],
  },
];

export const CTA = {
  heading: { en: "Ready to steal attention?", de: "Bereit, Aufmerksamkeit zu stehlen?" } as Bi,
  line1: { en: "Your competitors won't like us.", de: "Deine Konkurrenz wird uns nicht mögen." } as Bi,
  line2: { en: "Your customers will.", de: "Deine Kunden schon." } as Bi,
  button: { en: "Start your project.", de: "Projekt starten." } as Bi,
};
