// Services / "Leistungen" — content for the light home-look page.
// Eight service chapters + hero, intro, "und mehr" marquee, process, starter
// models and closing copy. Bilingual (Bandita voice: cheeky, but never sloppy).

export type Bi = { en: string; de: string };

export type Chapter = {
  id: string;
  num: string; // "01" … "08"
  color: string; // mood accent flooding the chapter (glow + index dot + pills)
  label: Bi; // short label used in the sticky index
  title: Bi; // big display title
  claim: Bi; // the cheeky one-line hook (rendered as the headline)
  lines: Bi[]; // supporting copy
  services: string[]; // concrete deliverables (industry terms, kept as-is)
  images: string[]; // real proof photos (floating cards)
};

export const HERO = {
  eyebrow: { en: "One team · Every discipline · Vienna, worldwide", de: "Ein Team · Alle Disziplinen · Wien, weltweit" } as Bi,
  line1: { en: "Everything your brand", de: "Alles, was deine Marke" } as Bi,
  line2: { en: "needs. Under one roof.", de: "braucht. Aus einer Hand." } as Bi,
  sub: {
    en: "Strategy that sells. Creative you don't scroll past. Eight disciplines, one team — from the first idea to the last frame.",
    de: "Strategie, die verkauft. Kreation, an der man nicht vorbeiscrollt. Acht Disziplinen, ein Team — von der ersten Idee bis zum letzten Frame.",
  } as Bi,
  button: { en: "Start a project", de: "Projekt anfragen" } as Bi,
  index: { en: "Services", de: "Leistungen" } as Bi,
};

export const INTRO: Bi[] = [
  { en: "Most agencies sell services.", de: "Die meisten Agenturen verkaufen Leistungen." },
  { en: "We build brands people can't forget.", de: "Wir bauen Marken, die man nicht vergisst." },
  { en: "Strategy, design, film, sound, tech and storytelling —", de: "Strategie, Design, Film, Sound, Technologie und Storytelling —" },
  { en: "we don't separate them. Everything belongs together.", de: "wir trennen das nicht. Alles gehört zusammen." },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "brand",
    num: "01",
    color: "#FFC23D", // Gelb
    label: { en: "Brand Strategy", de: "Markenstrategie" },
    title: { en: "Brand Strategy & Identity", de: "Markenstrategie & Identität" },
    claim: {
      en: "Anyone can design a logo. We build reasons to buy.",
      de: "Andere gestalten Logos. Wir bauen Gründe, warum man kauft.",
    },
    lines: [
      { en: "People don't fall in love with logos. They fall in love with stories.", de: "Menschen verlieben sich nicht in Logos. Sie verlieben sich in Geschichten." },
      { en: "Positioning, identity, voice, character — built on neuromarketing, not gut feeling.", de: "Positionierung, Identität, Stimme, Charakter — gebaut auf Neuromarketing, nicht auf Bauchgefühl." },
    ],
    services: ["Markenstrategie", "Positionierung", "Brand Identity", "Logo & Naming", "Neuromarketing", "Brand Guidelines"],
    images: ["/portfolio/besser-reisen/01.jpg", "/portfolio/publikationen/02.jpg"],
  },
  {
    id: "social",
    num: "02",
    color: "#FF5C9E", // Rosé
    label: { en: "Social Media", de: "Social Media" },
    title: { en: "Social Media Content", de: "Social Media Content" },
    claim: {
      en: "Content that stops the thumb.",
      de: "Content, der den Daumen stoppt.",
    },
    lines: [
      { en: "Beautiful brands mean nothing if nobody stops scrolling.", de: "Schöne Marken bedeuten nichts, wenn niemand aufhört zu scrollen." },
      { en: "Reels, campaigns and a content plan that gets saved, shared and remembered.", de: "Reels, Kampagnen und ein Redaktionsplan, der gespeichert, geteilt und gemerkt wird." },
    ],
    services: ["Content-Produktion", "Reels & Shorts", "Redaktionsplan", "Community Management", "Kampagnen", "Social Ads"],
    images: ["/portfolio/hotel/01.jpg", "/portfolio/hotel/03.jpg"],
  },
  {
    id: "film",
    num: "03",
    color: "#FB003F", // Pink
    label: { en: "Film Production", de: "Filmproduktion" },
    title: { en: "Film Production", de: "Filmproduktion" },
    claim: {
      en: "Shot on a real cinema camera. Not a phone zoom.",
      de: "Gedreht auf echter Kinokamera. Kein Handy-Zoom.",
    },
    lines: [
      { en: "Anyone can record a video. We create emotions.", de: "Jeder kann ein Video aufnehmen. Wir erschaffen Emotionen." },
      { en: "Image films, commercials, reels — real light, real story, images like Netflix.", de: "Imagefilme, Werbespots, Reels — echtes Licht, echtes Storytelling, Bilder wie Netflix." },
    ],
    services: ["Imagefilm", "Werbespot", "Reels & Shorts", "Drohne", "Schnitt & Grading", "Regie & Storytelling"],
    images: ["/portfolio/video/deutschland-gta-poster.jpg", "/portfolio/video/portugal-reel-01-poster.jpg"],
  },
  {
    id: "photo",
    num: "04",
    color: "#FF8A5B", // Coral
    label: { en: "Photography", de: "Fotografie" },
    title: { en: "Photography & Product", de: "Fotografie & Produkt" },
    claim: {
      en: "Yes, photographed. Not AI-generated. We do both.",
      de: "Ja, fotografiert. Nicht KI-generiert. Wir können beides.",
    },
    lines: [
      { en: "Before people read, they see. We don't shoot products — we create desire.", de: "Bevor Menschen lesen, sehen sie. Wir fotografieren keine Produkte — wir erschaffen Begehrlichkeit." },
      { en: "Product, editorial, fashion, campaign — for brands that appeared in real publications.", de: "Produkt, Editorial, Fashion, Kampagne — für Marken, die in echten Publikationen erschienen." },
    ],
    services: ["Produktfotografie", "Editorial", "Fashion", "Kampagne", "Still Life", "Website Shooting"],
    images: ["/portfolio/product/01.jpg", "/portfolio/plein/02.jpg"],
  },
  {
    id: "web",
    num: "05",
    color: "#5FC9BC", // Teal
    label: { en: "Web & 3D", de: "Web & 3D" },
    title: { en: "Web & 3D Experiences", de: "Web & 3D-Erlebnisse" },
    claim: {
      en: "Websites people remember.",
      de: "Websites, an die man sich erinnert.",
    },
    lines: [
      { en: "Your website shouldn't explain your brand. It should make people feel it.", de: "Deine Website soll deine Marke nicht erklären. Sie soll sie fühlbar machen." },
      { en: "No templates. No builders. Only experiences — the one you're scrolling through right now.", de: "Keine Templates. Keine Baukästen. Nur Erlebnisse — wie das hier, durch das du gerade scrollst." },
    ],
    services: ["Premium Websites", "3D-Websites", "Interactive Design", "UX / UI", "Landing Pages", "SEO"],
    images: ["/portfolio/website/01.jpg", "/portfolio/website/03.jpg"],
  },
  {
    id: "audio",
    num: "06",
    color: "#A88BEB", // Violet
    label: { en: "Music & Audio", de: "Musik & Audio" },
    title: { en: "Music & Audio", de: "Musik & Audio" },
    claim: {
      en: "The best brands, you recognise by their sound.",
      de: "Die besten Marken erkennt man am Sound.",
    },
    lines: [
      { en: "Some brands you recognise by the logo. The best ones you recognise by the sound.", de: "Manche Marken erkennt man am Logo. Die besten erkennt man am Klang." },
      { en: "Sound branding, composition and production — led by a Starmania voice.", de: "Sound-Branding, Komposition und Produktion — geleitet von einer Starmania-Stimme." },
    ],
    services: ["Sound Branding", "Komposition", "Musikproduktion", "Audio-Identität", "Voice & Jingle", "Mixing"],
    images: ["/portfolio/wiener-bar/01.jpg", "/portfolio/innsider/01.jpg"],
  },
  {
    id: "digital",
    num: "07",
    color: "#5CA8D6", // Blue
    label: { en: "Digital & Consulting", de: "Digitalisierung" },
    title: { en: "Digitalisation & Consulting", de: "Digitalisierung & Unternehmensberatung" },
    claim: {
      en: "We don't just digitise processes. We future-proof your business.",
      de: "Wir digitalisieren nicht nur Prozesse. Wir machen dein Business zukunftssicher.",
    },
    lines: [
      { en: "Consulting that doesn't disappear into a drawer.", de: "Beratung, die nicht in der Schublade verschwindet." },
      { en: "We find where you lose time, money and nerves — and build digital workflows that actually work.", de: "Wir finden, wo du Zeit, Geld und Nerven verlierst — und bauen digitale Abläufe, die wirklich funktionieren." },
    ],
    services: ["Digitalisierungsstrategie", "Prozessoptimierung", "Unternehmensberatung", "Automatisierung", "Tools & Systeme", "Workflow-Design"],
    images: ["/portfolio/publikationen/01.jpg", "/portfolio/kern/02.jpg"],
  },
  {
    id: "ai",
    num: "08",
    color: "#C9A2FF", // Light violet
    label: { en: "Artificial Intelligence", de: "Künstliche Intelligenz" },
    title: { en: "Artificial Intelligence", de: "Künstliche Intelligenz" },
    claim: {
      en: "AI doesn't replace a good idea. It accelerates it.",
      de: "KI ersetzt keine gute Idee. Sie beschleunigt sie.",
    },
    lines: [
      { en: "We don't use AI as a buzzword. We use it as a tool.", de: "Wir nutzen KI nicht als Buzzword, sondern als Werkzeug." },
      { en: "From AI-driven content and smart automation to custom AI solutions — made usable for your business.", de: "Von KI-gestütztem Content über smarte Automatisierung bis zu maßgeschneiderten AI-Lösungen — nutzbar für dein Business." },
    ],
    services: ["AI-Strategie", "KI-Content", "Custom AI-Lösungen", "Chatbots & Assistenten", "KI-Automatisierung", "AI-Integration"],
    images: ["/portfolio/tourism-international/01.jpg", "/portfolio/product/03.jpg"],
  },
];

// "und mehr" — extra disciplines shown as a scrolling marquee.
export const MORE = {
  kicker: { en: "And there's more.", de: "Und da ist noch mehr." } as Bi,
  items: [
    "Performance Marketing",
    "Google Ads",
    "Meta Ads",
    "TikTok Ads",
    "Events",
    "Merchandise",
    "Print Design",
    "Packaging",
    "Creative Direction",
    "Creative Consulting",
  ],
};

// How we work — four honest steps.
export const PROCESS = {
  kicker: { en: "How we work", de: "So arbeiten wir" } as Bi,
  heading: { en: "No guessing. A method.", de: "Kein Raten. Eine Methode." } as Bi,
  steps: [
    {
      num: "01",
      title: { en: "Understand", de: "Verstehen" } as Bi,
      body: { en: "We dig into your business, your market and your customers — before a single pixel.", de: "Wir tauchen in dein Business, deinen Markt und deine Kunden ein — vor dem ersten Pixel." } as Bi,
    },
    {
      num: "02",
      title: { en: "Strategy", de: "Strategie" } as Bi,
      body: { en: "Positioning and a plan built on psychology. Reasons to buy, not just things to look at.", de: "Positionierung und ein Plan auf Basis von Psychologie. Gründe zu kaufen, nicht nur Dinge zum Anschauen." } as Bi,
    },
    {
      num: "03",
      title: { en: "Creation", de: "Kreation" } as Bi,
      body: { en: "Brand, content, film, web, sound — produced in-house, with a handwriting you can see.", de: "Brand, Content, Film, Web, Sound — inhouse produziert, mit einer Handschrift, die man sieht." } as Bi,
    },
    {
      num: "04",
      title: { en: "Launch & Scale", de: "Launch & Skalierung" } as Bi,
      body: { en: "We ship, measure and grow it. Likes fade. Memories stay — and so do we.", de: "Wir launchen, messen und skalieren. Likes verschwinden. Erinnerungen bleiben — und wir auch." } as Bi,
    },
  ],
};

// Pricing — deliberately no fixed numbers. Three entry models + "auf Anfrage".
export const PRICING = {
  kicker: { en: "Where to start", de: "Wo du startest" } as Bi,
  heading: { en: "Starter models. Priced individually.", de: "Startermodelle. Individuell kalkuliert." } as Bi,
  sub: {
    en: "Every brand is different, so every price is too. Pick a starting point — we'll shape the rest together.",
    de: "Jede Marke ist anders, also jeder Preis auch. Wähl einen Startpunkt — den Rest formen wir gemeinsam.",
  } as Bi,
  priceLabel: { en: "Price on request", de: "Preis auf Anfrage" } as Bi,
  featuredLabel: { en: "Most popular", de: "Am beliebtesten" } as Bi,
  button: { en: "Request this", de: "Anfragen" } as Bi,
  tiers: [
    {
      id: "starter",
      name: { en: "Starter", de: "Starter" } as Bi,
      tagline: { en: "For a clear, single project.", de: "Für ein klar umrissenes Projekt." } as Bi,
      featured: false,
      includes: [
        { en: "One discipline, done right", de: "Eine Disziplin, richtig gemacht" },
        { en: "e.g. branding pack or a reel set", de: "z.B. Branding-Paket oder ein Reel-Set" },
        { en: "Fixed scope, fixed timeline", de: "Fixer Umfang, fixer Zeitplan" },
        { en: "Perfect to get to know us", de: "Perfekt zum Kennenlernen" },
      ],
    },
    {
      id: "growth",
      name: { en: "Growth", de: "Wachstum" } as Bi,
      tagline: { en: "Ongoing brand momentum.", de: "Laufende Marken-Power." } as Bi,
      featured: true,
      includes: [
        { en: "Content + social + ads, monthly", de: "Content + Social + Ads, monatlich" },
        { en: "Recurring shoot days", de: "Wiederkehrende Drehtage" },
        { en: "Strategy & reporting", de: "Strategie & Reporting" },
        { en: "One team, always on", de: "Ein Team, immer dran" },
      ],
    },
    {
      id: "partnership",
      name: { en: "Full-Service", de: "Full-Service" } as Bi,
      tagline: { en: "Your creative department. Without hiring one.", de: "Deine Kreativabteilung. Ohne sie einzustellen." } as Bi,
      featured: false,
      includes: [
        { en: "All eight disciplines, one partner", de: "Alle acht Disziplinen, ein Partner" },
        { en: "Brand, film, web, sound, ads", de: "Brand, Film, Web, Sound, Ads" },
        { en: "Priority & dedicated leads", de: "Priorität & feste Ansprechpartner" },
        { en: "Online. Offline. Everything.", de: "Online. Offline. Alles." },
      ],
    },
  ],
};

export const CLOSE = {
  heading: { en: "Ready to steal attention?", de: "Bereit, Aufmerksamkeit zu stehlen?" } as Bi,
  line1: { en: "Your competitors won't like us.", de: "Deine Konkurrenz wird uns nicht mögen." } as Bi,
  line2: { en: "Your customers will.", de: "Deine Kunden schon." } as Bi,
  button: { en: "Start your project", de: "Projekt starten" } as Bi,
};
