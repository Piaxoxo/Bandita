// Services / "Leistungen" — content for the light home-look page.
// Bilingual prose (Bandita voice: cheeky, direct, but highest-professional —
// built on neuromarketing). Enumerated / technical lists use international
// industry terms (the way Bandita already writes), so they read in both DE/EN.

export type Bi = { en: string; de: string };

// ── Chapter storytelling ──────────────────────────────────────────────────
export type Chapter = {
  id: string;
  num: string;
  color: string;
  label: Bi;
  title: Bi;
  claim: Bi;
  lines: Bi[];
  services: string[];
  images: string[];
  portfolioId?: string; // deep-link into the matching portfolio project
};

export const HERO = {
  eyebrow: { en: "One team · Every discipline · Vienna, worldwide", de: "Ein Team · Alle Disziplinen · Wien, weltweit" } as Bi,
  line1: { en: "Everything your brand", de: "Alles, was deine Marke" } as Bi,
  line2: { en: "needs. Under one roof.", de: "braucht. Aus einer Hand." } as Bi,
  sub: {
    en: "Strategy that sells. Creative you don't scroll past. From brand and film to AI-generated campaigns — one team, from the first idea to the last frame.",
    de: "Strategie, die verkauft. Kreation, an der man nicht vorbeiscrollt. Von Brand und Film bis zu KI-generierten Kampagnen — ein Team, von der ersten Idee bis zum letzten Frame.",
  } as Bi,
  button: { en: "Start a project", de: "Projekt anfragen" } as Bi,
  button2: { en: "See the work", de: "Arbeiten ansehen" } as Bi,
  index: { en: "Services", de: "Leistungen" } as Bi,
};

export const INTRO: Bi[] = [
  { en: "Most agencies sell services.", de: "Die meisten Agenturen verkaufen Leistungen." },
  { en: "We build brands people can't forget.", de: "Wir bauen Marken, die man nicht vergisst." },
  { en: "Strategy, design, film, sound, tech, AI —", de: "Strategie, Design, Film, Sound, Technologie, KI —" },
  { en: "we don't separate them. Everything belongs together.", de: "wir trennen das nicht. Alles gehört zusammen." },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "brand",
    num: "01",
    color: "#FFC23D",
    label: { en: "Brand Strategy", de: "Markenstrategie" },
    title: { en: "Brand Strategy & Design", de: "Markenstrategie & Design" },
    claim: { en: "Anyone can design a logo. We build reasons to buy.", de: "Andere gestalten Logos. Wir bauen Gründe, warum man kauft." },
    lines: [
      { en: "People don't fall in love with logos. They fall in love with stories.", de: "Menschen verlieben sich nicht in Logos. Sie verlieben sich in Geschichten." },
      { en: "Positioning, identity, voice, character — built on neuromarketing, not gut feeling.", de: "Positionierung, Identität, Stimme, Charakter — gebaut auf Neuromarketing, nicht auf Bauchgefühl." },
    ],
    services: ["Brand Strategy", "Positioning", "Logo & Naming", "Corporate Identity", "Brand Guidelines", "Rebranding", "Packaging", "Editorial Design", "Creative Direction"],
    images: ["/portfolio/besser-reisen/01.jpg", "/portfolio/publikationen/01.jpg"],
    portfolioId: "besser-reisen",
  },
  {
    id: "social",
    num: "02",
    color: "#FF5C9E",
    label: { en: "Social Media", de: "Social Media" },
    title: { en: "Social Media", de: "Social Media" },
    claim: { en: "Content that stops the thumb.", de: "Content, der den Daumen stoppt." },
    lines: [
      { en: "Beautiful brands mean nothing if nobody stops scrolling.", de: "Schöne Marken bedeuten nichts, wenn niemand aufhört zu scrollen." },
      { en: "Reels, campaigns and a content plan that gets saved, shared and remembered.", de: "Reels, Kampagnen und ein Redaktionsplan, der gespeichert, geteilt und gemerkt wird." },
    ],
    services: ["Content Strategy", "Reels & Shorts", "Community Management", "Instagram", "TikTok", "LinkedIn", "Influencer Marketing", "Paid Social", "Content in 10+ languages"],
    images: ["/work/guests-01.jpg", "/portfolio/kern/01.jpg"],
    portfolioId: "hotel",
  },
  {
    id: "film",
    num: "03",
    color: "#FB003F",
    label: { en: "Film Production", de: "Filmproduktion" },
    title: { en: "Film Production", de: "Filmproduktion" },
    claim: { en: "Shot on a real cinema camera. Not a phone zoom.", de: "Gedreht auf echter Kinokamera. Kein Handy-Zoom." },
    lines: [
      { en: "Anyone can record a video. We create emotions. People remember feelings, not resolutions.", de: "Jeder kann ein Video aufnehmen. Wir erschaffen Emotionen. Menschen erinnern sich an Gefühle, nicht an Auflösungen." },
      { en: "Commercials, image films, reels — Hollywood for businesses.", de: "Werbespots, Imagefilme, Reels — Hollywood für Unternehmen." },
    ],
    services: ["Commercials", "Image Films", "Product Films", "Social Reels", "Recruiting Videos", "Drone", "FPV", "Cinematic Editing", "Color Grading"],
    images: ["/work/film-01.jpg", "/portfolio/video/deutschland-gta-poster.jpg"],
    portfolioId: "deutschland",
  },
  {
    id: "photo",
    num: "04",
    color: "#FF8A5B",
    label: { en: "Photography", de: "Fotografie" },
    title: { en: "Photography & Product", de: "Fotografie & Produkt" },
    claim: { en: "Yes, photographed. Not AI-generated. We do both.", de: "Ja, fotografiert. Nicht KI-generiert. Wir können beides." },
    lines: [
      { en: "Before people read, they see. We don't shoot products — we create desire.", de: "Bevor Menschen lesen, sehen sie. Wir fotografieren keine Produkte — wir erschaffen Begehrlichkeit." },
      { en: "Editorial, fashion, product, campaign — work that appeared in real publications.", de: "Editorial, Fashion, Produkt, Kampagne — Arbeiten, die in echten Publikationen erschienen." },
    ],
    services: ["Product Photography", "Editorial", "Fashion", "Campaign", "Still Life", "Website Shooting"],
    images: ["/portfolio/product/01.jpg", "/portfolio/plein/02.jpg"],
    portfolioId: "product",
  },
  {
    id: "web",
    num: "05",
    color: "#5FC9BC",
    label: { en: "Web & 3D", de: "Web & 3D" },
    title: { en: "Websites & Digital Experiences", de: "Websites & Digital Experiences" },
    claim: { en: "Websites people remember.", de: "Websites, an die man sich erinnert." },
    lines: [
      { en: "Your website shouldn't explain your brand. It should make people feel it.", de: "Deine Website soll deine Marke nicht erklären. Sie soll sie fühlbar machen." },
      { en: "No templates. No builders. Only experiences — like the one you're scrolling through right now.", de: "Keine Templates. Keine Baukästen. Nur Erlebnisse — wie das hier, durch das du gerade scrollst." },
    ],
    services: ["Premium Websites", "3D Websites", "Online Shops", "Landing Pages", "UX / UI Design", "Booking Integrations", "CMS", "Performance", "Hosting"],
    images: ["/portfolio/website/01.jpg", "/portfolio/website/03.jpg"],
    portfolioId: "website",
  },
  {
    id: "audio",
    num: "06",
    color: "#A88BEB",
    label: { en: "Music & Audio", de: "Musik & Audio" },
    title: { en: "Audio Production", de: "Audio Production" },
    claim: { en: "A brand has a face. And a voice.", de: "Marken haben ein Gesicht. Und eine Stimme." },
    lines: [
      { en: "Some brands you recognise by the logo. The best ones you recognise by the sound.", de: "Manche Marken erkennt man am Logo. Die besten erkennt man am Klang." },
      { en: "Sound branding, composition and production — led by a Starmania voice.", de: "Sound-Branding, Komposition und Produktion — geleitet von einer Starmania-Stimme." },
    ],
    services: ["Audio Branding", "Jingles", "Music Production", "Podcasts", "Voice Over", "Sound Design", "Mixing & Mastering"],
    images: ["/portfolio/wiener-bar/01.jpg", "/work/bar-01.jpg"],
    portfolioId: "wiener-bar",
  },
  {
    id: "digital",
    num: "07",
    color: "#5CA8D6",
    label: { en: "SEO & Growth", de: "SEO & Growth" },
    title: { en: "SEO, Growth & Consulting", de: "SEO, Growth & Beratung" },
    claim: { en: "Not more ads. More customers.", de: "Nicht mehr Werbung. Mehr Kunden." },
    lines: [
      { en: "Consulting that doesn't disappear into a drawer. We find where you lose time, money and nerves — and fix it.", de: "Beratung, die nicht in der Schublade verschwindet. Wir finden, wo du Zeit, Geld und Nerven verlierst — und lösen es." },
      { en: "SEO, funnels, automation and live dashboards that turn attention into revenue.", de: "SEO, Funnels, Automatisierung und Live-Dashboards, die Aufmerksamkeit in Umsatz verwandeln." },
    ],
    services: ["SEO", "Local SEO", "Google Business", "Google Ads", "Conversion Optimisation", "Funnels", "Marketing Automation", "Analytics", "Dashboards"],
    images: ["/portfolio/tourism-international/01.jpg", "/work/event-01.jpg"],
    portfolioId: "publikationen",
  },
  {
    id: "ai",
    num: "08",
    color: "#C9A2FF",
    label: { en: "Artificial Intelligence", de: "Künstliche Intelligenz" },
    title: { en: "AI Solutions & AI Content", de: "KI-Lösungen & KI-Content" },
    claim: { en: "You work. AI handles the rest.", de: "Unternehmen arbeiten. KI übernimmt den Rest." },
    lines: [
      { en: "We don't use AI as a buzzword. We use it as a tool — from AI agents that run your business to campaigns generated without a single shoot.", de: "Wir nutzen KI nicht als Buzzword, sondern als Werkzeug — von AI-Agents, die dein Business steuern, bis zu Kampagnen ohne ein einziges Shooting." },
      { en: "Scroll on for the AI Studio — content without a camera.", de: "Scroll weiter zum AI Studio — Content ohne Kamera." },
    ],
    services: ["AI Agents", "Business AI", "Website Concierge", "AI Customer Service", "AI Automation", "Prompt Engineering", "AI Image Production", "AI Video", "AI Consulting"],
    images: ["/portfolio/plein/03.jpg", "/portfolio/product/03.jpg"],
    portfolioId: "tourism-international",
  },
];

// ── AI STUDIO — the flagship "content without a shoot" offering ─────────────
export type Studio = {
  id: string;
  color: string;
  name: Bi;
  claim: Bi;
  lines: Bi[];
  tagsLabel: Bi; // "Ideal for" / "Use cases"
  tags: string[];
  image: string;
};

export const AISTUDIO = {
  kicker: { en: "Bandita AI Studio", de: "Bandita AI Studio" } as Bi,
  heading: { en: "Campaigns without a camera.", de: "Kampagnen ohne Kamera." } as Bi,
  sub: {
    en: "Editorial-grade images and videos, generated with cutting-edge AI and photographic quality control. No models. No location. No production cost. Just visuals that sell.",
    de: "Bilder und Videos in Editorial-Qualität, erstellt mit modernster KI und fotografischer Qualitätskontrolle. Keine Models. Keine Location. Keine Produktionskosten. Nur Bilder, die verkaufen.",
  } as Bi,
  cta: { en: "See AI pricing", de: "AI-Preise ansehen" } as Bi,
  studios: [
    {
      id: "fashion", color: "#FF5C9E",
      name: { en: "AI Fashion Studio", de: "AI Fashion Studio" },
      claim: { en: "Fashion content. Without a shoot.", de: "Fashion Content. Ohne Shooting." },
      lines: [
        { en: "Professional editorial, e-commerce and social images of your collection.", de: "Professionelle Editorial-, E-Commerce- und Social-Bilder Ihrer Kollektion." },
        { en: "No models. No location. No production cost. Just visuals that convert.", de: "Keine Models. Keine Location. Keine Produktionskosten. Nur verkaufsstarke Bilder." },
      ],
      tagsLabel: { en: "Ideal for", de: "Ideal für" },
      tags: ["Fashion Brands", "Boutiques", "Jewellery", "Bags", "Shoes", "Beauty", "Luxury", "Designers", "Concept Stores"],
      image: "/portfolio/plein/02.jpg",
    },
    {
      id: "product", color: "#FF8A5B",
      name: { en: "AI Product Studio", de: "AI Product Studio" },
      claim: { en: "Products, perfectly staged.", de: "Produkte perfekt inszeniert." },
      lines: [
        { en: "Simple product photos become high-end campaign visuals — not on white, but where your brand lives.", de: "Aus einfachen Produktfotos entstehen hochwertige Werbebilder — nicht auf Weiß, sondern dort, wo Ihre Marke lebt." },
        { en: "Cocktail on a rooftop. Perfume on Italian marble. Sneakers in Tokyo. Campaigns, not product shots.", de: "Cocktail auf der Rooftop-Bar. Parfum auf italienischem Marmor. Sneaker in Tokio. Kampagnen, keine Produktbilder." },
      ],
      tagsLabel: { en: "Use cases", de: "Einsatzgebiete" },
      tags: ["E-Commerce", "Amazon", "Shopify", "Social Media", "Print", "Billboards", "Magazines", "Campaigns"],
      image: "/portfolio/product/02.jpg",
    },
    {
      id: "food", color: "#FFC23D",
      name: { en: "AI Food Studio", de: "AI Food Studio" },
      claim: { en: "Food content without a food shoot.", de: "Food Content ohne Food Shooting." },
      lines: [
        { en: "One phone photo is enough. We turn it into advertising campaigns.", de: "Ein einziges Handyfoto reicht. Wir verwandeln es in Werbekampagnen." },
        { en: "Cocktail on the beach. Burger in a neon diner. Steak in fine dining. Dessert in editorial.", de: "Cocktail am Strand. Burger im Neon-Diner. Steak im Fine Dining. Dessert im Editorial Look." },
      ],
      tagsLabel: { en: "Perfect for", de: "Perfekt für" },
      tags: ["Restaurants", "Hotels", "Bars", "Delivery", "Food Brands"],
      image: "/work/food-01.jpg",
    },
    {
      id: "interior", color: "#5FC9BC",
      name: { en: "AI Interior Studio", de: "AI Interior Studio" },
      claim: { en: "Architecture, perfectly staged.", de: "Architektur perfekt in Szene gesetzt." },
      lines: [
        { en: "We turn your rooms into luxurious lifestyle imagery.", de: "Wir erzeugen luxuriöse Lifestyle-Bilder aus Ihren Räumen." },
      ],
      tagsLabel: { en: "For", de: "Für" },
      tags: ["Hotels", "Airbnb", "Restaurants", "Real Estate", "Interior Design", "Furniture", "Decor"],
      image: "/portfolio/wiener-restaurant/01.jpg",
    },
    {
      id: "campaign", color: "#FB003F",
      name: { en: "AI Campaign Studio", de: "AI Campaign Studio" },
      claim: { en: "Complete campaigns. Not one image. Fifty. A hundred.", de: "Komplette Kampagnen. Nicht ein Bild. Fünfzig. Hundert." },
      lines: [
        { en: "All in the same style. Ready for every channel.", de: "Alle im gleichen Stil. Bereit für jeden Kanal." },
      ],
      tagsLabel: { en: "Perfect for", de: "Perfekt für" },
      tags: ["Meta Ads", "Google Ads", "Instagram", "TikTok", "Lookbooks", "Magazines"],
      image: "/portfolio/besser-reisen/03.jpg",
    },
    {
      id: "model", color: "#A88BEB",
      name: { en: "AI Model Studio", de: "AI Model Studio" },
      claim: { en: "Never book a model again.", de: "Nie wieder Model buchen." },
      lines: [
        { en: "Fashion, business, senior models, families, kids — in your corporate look.", de: "Fashion-, Business-, Senior-Models, Familien, Kinder — in Ihrem Corporate Look." },
      ],
      tagsLabel: { en: "Styles", de: "Styles" },
      tags: ["Luxury Editorials", "Streetwear", "Business Fashion", "Beauty", "Lifestyle"],
      image: "/portfolio/plein/03.jpg",
    },
    {
      id: "video", color: "#5CA8D6",
      name: { en: "AI Video Studio", de: "AI Video Studio" },
      claim: { en: "Images become videos.", de: "Aus Bildern entstehen Videos." },
      lines: [
        { en: "Commercials, reels, product videos, cinematic films, CGI — even AI catwalks.", de: "Werbespots, Reels, Produktvideos, cinematische Filme, CGI — sogar AI-Catwalks." },
      ],
      tagsLabel: { en: "Formats", de: "Formate" },
      tags: ["Commercials", "Reels", "TikToks", "Product Videos", "CGI", "3D Product Films", "AI Fashion Walks", "AI Food Videos"],
      image: "/portfolio/video/portugal-reel-01-poster.jpg",
    },
    {
      id: "subscription", color: "#FF8A5B",
      name: { en: "AI Content Subscription", de: "AI Content Subscription" },
      claim: { en: "New content, every month.", de: "Monatlich neue Inhalte." },
      lines: [
        { en: "Ideal for businesses with regularly changing products.", de: "Ideal für Unternehmen mit regelmäßig neuen Produkten." },
      ],
      tagsLabel: { en: "Includes", de: "Enthält" },
      tags: ["AI Photos", "AI Videos", "AI Ads", "AI Banners", "AI Campaigns", "AI Social Posts"],
      image: "/portfolio/kern/01.jpg",
    },
  ] as Studio[],
};

// ── OUR SERVICES — full filterable catalogue ───────────────────────────────
export type CatFilter = { key: string; label: Bi };
export type Category = {
  num: string;
  key: string; // matches a filter key
  title: Bi;
  claim: Bi;
  items: string[];
};

export const CATALOGUE = {
  kicker: { en: "Our Services", de: "Unsere Leistungen" } as Bi,
  heading: { en: "Find exactly what you're looking for.", de: "Finde genau das, was du suchst." } as Bi,
  sub: { en: "Every discipline, in-house. Filter by what you need.", de: "Jede Disziplin, inhouse. Filter nach dem, was du brauchst." } as Bi,
  allLabel: { en: "All", de: "Alle" } as Bi,
  filters: [
    { key: "brand", label: { en: "Brand", de: "Brand" } },
    { key: "web", label: { en: "Web", de: "Web" } },
    { key: "ai", label: { en: "AI", de: "AI" } },
    { key: "seo", label: { en: "SEO & Growth", de: "SEO & Growth" } },
    { key: "social", label: { en: "Social", de: "Social" } },
    { key: "film", label: { en: "Film", de: "Film" } },
    { key: "audio", label: { en: "Audio", de: "Audio" } },
    { key: "events", label: { en: "Events", de: "Events" } },
    { key: "print", label: { en: "Print", de: "Print" } },
    { key: "hospitality", label: { en: "Hospitality", de: "Hospitality" } },
  ] as CatFilter[],
  categories: [
    {
      num: "01", key: "brand",
      title: { en: "Brand Strategy & Design", de: "Brand Strategy & Design" },
      claim: { en: "Brands you recognise. Personalities you don't forget.", de: "Marken, die man erkennt. Persönlichkeiten, die man nicht vergisst." },
      items: ["Brand Strategy", "Logo Design", "Corporate Identity", "Brand Guidelines", "Rebranding", "Naming", "Packaging", "Editorial Design", "Print Design", "Creative Direction"],
    },
    {
      num: "02", key: "web",
      title: { en: "Websites & Digital Experiences", de: "Websites & Digital Experiences" },
      claim: { en: "No templates. Digital experiences.", de: "Keine Templates. Digitale Erlebnisse." },
      items: ["Premium Websites", "3D Websites", "Landing Pages", "Online Shops", "Hotel Websites", "Restaurant Websites", "UX / UI Design", "Booking Integrations", "CMS", "Website Maintenance", "Performance", "GDPR", "Hosting"],
    },
    {
      num: "03", key: "ai",
      title: { en: "AI Solutions", de: "KI-Lösungen" },
      claim: { en: "You work. AI handles the rest.", de: "Unternehmen arbeiten. KI übernimmt den Rest." },
      items: ["Business AI Assistants", "Website AI Concierge", "AI Customer Service", "AI Reservations", "AI Quoting", "AI Email Automation", "AI Marketing Automation", "AI Workflows", "AI Knowledge Bases", "Chatbots", "Voice AI", "AI Agents", "Custom GPT Systems", "AI Consulting"],
    },
    {
      num: "04", key: "seo",
      title: { en: "SEO & Growth", de: "SEO & Growth" },
      claim: { en: "Not more ads. More customers.", de: "Nicht mehr Werbung. Mehr Kunden." },
      items: ["SEO", "Local SEO", "Google Business", "Google Ads", "Conversion Optimisation", "Landing Page Optimisation", "Analytics", "Performance Tracking", "Marketing Dashboards", "Funnels", "Email Marketing", "Marketing Automation"],
    },
    {
      num: "05", key: "social",
      title: { en: "Social Media", de: "Social Media" },
      claim: { en: "Content with addiction potential.", de: "Content mit Suchtpotenzial." },
      items: ["Strategy", "Content Production", "Community Management", "Instagram", "TikTok", "LinkedIn", "Facebook", "Pinterest", "Influencer Marketing", "Paid Social", "Content Planning", "Content in 10+ languages"],
    },
    {
      num: "06", key: "film",
      title: { en: "Film Production", de: "Filmproduktion" },
      claim: { en: "Hollywood for businesses.", de: "Hollywood für Unternehmen." },
      items: ["Commercials", "Image Films", "Product Films", "Hospitality Content", "Hotel Content", "Social Reels", "Interviews", "Recruiting Videos", "Event Films", "Drone", "FPV", "Behind the Scenes", "Cinematic Editing", "Color Grading"],
    },
    {
      num: "07", key: "audio",
      title: { en: "Audio Production", de: "Audio Production" },
      claim: { en: "A brand has a face. And a voice.", de: "Marken haben ein Gesicht. Und eine Stimme." },
      items: ["Podcast Production", "Audio Branding", "Jingles", "Music Production", "Voice Over", "Sound Design", "Advertising", "Mixing & Mastering"],
    },
    {
      num: "08", key: "events",
      title: { en: "Events", de: "Events" },
      claim: { en: "Events nobody forgets.", de: "Events, die niemand vergisst." },
      items: ["Event Concepts", "Corporate Events", "Restaurant Events", "Hotel Events", "Product Launches", "Pop-Ups", "Influencer Events", "PR Events", "Trade Shows", "Live Production"],
    },
    {
      num: "09", key: "print",
      title: { en: "Merchandise & Print", de: "Merchandise & Print" },
      claim: { en: "Brands you can touch.", de: "Marken zum Anfassen." },
      items: ["Merchandise", "Apparel", "Stickers", "Packaging", "Menus", "Flyers", "Magazines", "Brochures", "Business Cards", "Roll-Ups", "POS Material"],
    },
    {
      num: "10", key: "hospitality",
      title: { en: "Hospitality Solutions", de: "Hospitality Solutions" },
      claim: { en: "Marketing built for hotels, restaurants & bars.", de: "Marketing speziell für Hotels, Restaurants & Bars." },
      items: ["Digital Menus", "Reservation Systems", "WhatsApp Reminders", "QR Ordering", "QR Reviews", "Review Management", "Digital Guest Folders", "Hotel Concierge", "Digital Signage", "Menu Screens", "Hotel TV Systems", "Interactive Experiences"],
    },
  ] as Category[],
};

// ── BROWSE BY INDUSTRY ─────────────────────────────────────────────────────
export type Industry = { id: string; emoji: string; name: Bi; items: string[] };

export const INDUSTRIES = {
  kicker: { en: "Browse by Industry", de: "Nach Branche" } as Bi,
  heading: { en: "Not by service. By your world.", de: "Nicht nach Leistung. Nach deiner Welt." } as Bi,
  sub: { en: "We speak your industry — and know exactly what makes it sell.", de: "Wir sprechen deine Branche — und wissen, was sie verkauft." } as Bi,
  items: [
    { id: "hospitality", emoji: "🍸", name: { en: "Hospitality", de: "Hospitality" }, items: ["Hotels", "Restaurants", "Bars", "Cafés", "Hostels", "Tourism"] },
    { id: "fashion", emoji: "👗", name: { en: "Fashion & Beauty", de: "Fashion & Beauty" }, items: ["Fashion", "Cosmetics", "Salons", "Beauty Studios", "Jewellery", "Luxury Brands"] },
    { id: "food", emoji: "🍔", name: { en: "Food & Beverage", de: "Food & Beverage" }, items: ["Restaurants", "Catering", "Food Brands", "Beverages", "Wineries", "Spirits"] },
    { id: "corporate", emoji: "🏢", name: { en: "Corporate", de: "Corporate" }, items: ["Tax Advisors", "Real Estate", "Law Firms", "Insurance", "Consulting", "B2B"] },
    { id: "retail", emoji: "🛒", name: { en: "Retail & E-Commerce", de: "Retail & E-Commerce" }, items: ["Online Shops", "Retail", "Startups", "Products", "Brands"] },
    { id: "entertainment", emoji: "🎭", name: { en: "Entertainment", de: "Entertainment" }, items: ["Music", "Events", "Festivals", "Artists", "Podcasts", "Creators"] },
  ] as Industry[],
};

// ── PRICING — real numbers, filterable ─────────────────────────────────────
export type Tier = {
  id: string;
  name: string;
  price: string;
  tags: string[]; // filter groups
  tagline: Bi;
  features: string[];
  featured?: boolean;
};

export const PRICING = {
  kicker: { en: "Pricing", de: "Preise" } as Bi,
  heading: { en: "Real prices. No fog.", de: "Echte Preise. Kein Nebel." } as Bi,
  sub: {
    en: "Starter models to full-service. Every brand is different — so pick a starting point and we'll shape the rest together.",
    de: "Vom Startermodell bis Full-Service. Jede Marke ist anders — wähl einen Startpunkt, den Rest formen wir gemeinsam.",
  } as Bi,
  allLabel: { en: "All", de: "Alle" } as Bi,
  button: { en: "Request this", de: "Anfragen" } as Bi,
  featuredLabel: { en: "Popular", de: "Beliebt" } as Bi,
  filters: [
    { key: "aicontent", label: { en: "AI Content", de: "AI Content" } },
    { key: "web", label: { en: "Web", de: "Web" } },
    { key: "social", label: { en: "Social", de: "Social" } },
    { key: "film", label: { en: "Film", de: "Film" } },
    { key: "ai", label: { en: "AI Systems", de: "AI Systeme" } },
    { key: "seo", label: { en: "SEO", de: "SEO" } },
    { key: "hospitality", label: { en: "Hospitality", de: "Hospitality" } },
    { key: "abo", label: { en: "Monthly", de: "Abo" } },
    { key: "premium", label: { en: "Premium", de: "Premium" } },
  ] as CatFilter[],
  tiers: [
    // AI CONTENT
    { id: "ai-fashion-starter", name: "AI Fashion Starter", price: "249 €", tags: ["aicontent"], tagline: { en: "5 outfits · 25 visuals", de: "5 Outfits · 25 Bilder" }, features: ["5 outfits", "25 visuals", "Editorial + Shop + Social"] },
    { id: "ai-fashion-growth", name: "AI Fashion Growth", price: "449 €", tags: ["aicontent"], tagline: { en: "10 outfits · 50 visuals", de: "10 Outfits · 50 Bilder" }, features: ["10 outfits", "50 visuals", "Editorial + Shop + Social"] },
    { id: "ai-fashion-unlimited", name: "AI Fashion Unlimited", price: "799 €", tags: ["aicontent"], tagline: { en: "20 outfits · 100 visuals", de: "20 Outfits · 100 Bilder" }, features: ["20 outfits", "100 visuals", "Full editorial set"] },
    { id: "ai-product-starter", name: "AI Product Starter", price: "299 €", tags: ["aicontent"], tagline: { en: "10 products · 30 visuals", de: "10 Produkte · 30 Bilder" }, features: ["10 products", "30 visuals", "Campaign backgrounds"] },
    { id: "ai-product-growth", name: "AI Product Growth", price: "649 €", tags: ["aicontent"], tagline: { en: "25 products · 75 visuals", de: "25 Produkte · 75 Bilder" }, features: ["25 products", "75 visuals", "Multiple scenes"] },
    { id: "ai-product-premium", name: "AI Product Premium", price: "1.199 €", tags: ["aicontent"], tagline: { en: "50 products · 150 visuals", de: "50 Produkte · 150 Bilder" }, features: ["50 products", "150 visuals", "Full campaign look"] },
    { id: "ai-restaurant", name: "AI Restaurant Content", price: "449 €", tags: ["aicontent", "hospitality"], tagline: { en: "20 dishes or cocktails · 100 visuals", de: "20 Gerichte oder Cocktails · 100 Bilder" }, features: ["20 dishes / cocktails", "100 visuals", "Editorial food look"] },
    { id: "ai-hotel", name: "AI Hotel Collection", price: "799 €", tags: ["aicontent", "hospitality"], tagline: { en: "30 rooms · lifestyle", de: "30 Räume · Lifestyle" }, features: ["30 rooms", "Lobby · Spa · Restaurant", "Lifestyle imagery"] },
    { id: "ai-campaign", name: "AI Campaign", price: "999 €", tags: ["aicontent"], tagline: { en: "50 campaign visuals", de: "50 Kampagnenbilder" }, features: ["50 campaign visuals", "Corporate style", "Multiple formats"] },
    { id: "ai-commercial", name: "AI Commercial", price: "ab 1.490 €", tags: ["aicontent", "film"], tagline: { en: "30s spot incl. AI video", de: "30-Sek-Spot inkl. AI-Video" }, features: ["30-second spot", "AI video", "Edit + music"] },
    { id: "ai-social", name: "AI Social Content", price: "690 €/mo", tags: ["aicontent", "social", "abo"], tagline: { en: "Monthly · 30 images · 12 videos", de: "Monatlich · 30 Bilder · 12 Videos" }, features: ["30 images", "12 videos", "Copy + hashtags"] },
    { id: "ai-content-pro", name: "AI Content Pro", price: "1.490 €/mo", tags: ["aicontent", "abo"], tagline: { en: "Monthly · 60 images · 20 videos", de: "Monatlich · 60 Bilder · 20 Videos" }, features: ["60 images", "20 videos", "Banners · Ads · Stories"] },
    { id: "ai-unlimited", name: "AI Unlimited", price: "ab 2.990 €/mo", tags: ["aicontent", "abo", "premium"], tagline: { en: "Unlimited AI production*", de: "Unbegrenzte AI-Produktion*" }, features: ["Unlimited AI images*", "Unlimited AI videos*", "Strategy · Prompt Engineering", "Content planning"], featured: true },
    // WEB
    { id: "web-starter", name: "Website Starter", price: "ab 2.990 €", tags: ["web"], tagline: { en: "For founders & small businesses", de: "Für Gründer & kleine Unternehmen" }, features: ["Logo", "Brand Identity", "5-page website", "Responsive", "Google Business", "SEO Basics", "Contact form", "Social setup"] },
    { id: "web-pro", name: "Website Pro", price: "ab 4.990 €", tags: ["web"], tagline: { en: "For businesses that want to sell", de: "Für Unternehmen, die verkaufen wollen" }, features: ["Custom design", "Premium website", "CMS", "On-page SEO", "Conversion optimisation", "Blog", "Analytics", "Hosting setup"], featured: true },
    { id: "web-signature", name: "Website Signature", price: "ab 8.990 €", tags: ["web", "premium"], tagline: { en: "High-end website", de: "High-End Website" }, features: ["Custom design", "Animations", "3D elements", "Premium UX", "Multilingual", "Performance", "CMS · SEO · Analytics"] },
    // FILM
    { id: "commercial", name: "Commercial", price: "ab 2.990 €", tags: ["film"], tagline: { en: "Commercial production", de: "Werbespot-Produktion" }, features: ["Concept", "Storyboard", "Shoot day", "Pro camera", "Drone", "Edit", "Color grading", "Music", "Social versions"] },
    { id: "cinema", name: "Cinema", price: "ab 5.990 €", tags: ["film", "premium"], tagline: { en: "Premium film production", de: "Premium Filmproduktion" }, features: ["Multiple shoot days", "Image film", "Reels", "Behind the scenes", "Interviews", "Drone · FPV", "Social cutdowns"], featured: true },
    { id: "content-sub", name: "Content Subscription", price: "2.490 €/mo", tags: ["film", "abo"], tagline: { en: "Film production, monthly", de: "Filmproduktion im Abo" }, features: ["2 production days", "12 reels", "Drone", "Interviews", "Product videos", "Color grading"] },
    { id: "content-unlimited", name: "Content Unlimited", price: "4.990 €/mo", tags: ["film", "abo", "premium"], tagline: { en: "Big productions, monthly", de: "Große Produktionen im Abo" }, features: ["4 production days", "Reels · commercials", "Image films", "Drone", "Photography", "Editing"] },
    // SOCIAL
    { id: "social-start", name: "Social Start", price: "890 €/mo", tags: ["social", "abo"], tagline: { en: "Social media, handled", de: "Social Media Betreuung" }, features: ["Content plan", "8 posts", "8 reels", "Story ideas", "Captions", "Reporting"] },
    { id: "social-growth", name: "Social Growth", price: "1.490 €/mo", tags: ["social", "abo"], tagline: { en: "For ambitious brands", de: "Für Unternehmen mit Ambitionen" }, features: ["16 reels", "20 posts", "Community support", "Content planning", "Strategy", "Performance analysis"], featured: true },
    { id: "social-domination", name: "Social Domination", price: "2.990 €/mo", tags: ["social", "abo", "premium"], tagline: { en: "Your full social department", de: "Komplette Social-Abteilung" }, features: ["Unlimited consulting", "30+ reels", "Photo content", "Community", "Campaigns", "Paid ads", "Reporting"] },
    // AI SYSTEMS
    { id: "ai-start", name: "AI Start", price: "ab 1.490 €", tags: ["ai"], tagline: { en: "AI for small businesses", de: "KI für kleine Unternehmen" }, features: ["Chatbot", "AI assistant", "FAQ", "Setup"] },
    { id: "ai-business", name: "AI Business", price: "ab 4.990 €", tags: ["ai"], tagline: { en: "Your own AI employee", de: "Eigener KI-Mitarbeiter" }, features: ["AI agent", "CRM integration", "Email automation", "Lead management", "Document AI", "Knowledge base"], featured: true },
    { id: "ai-enterprise", name: "AI Enterprise", price: "ab 12.990 €", tags: ["ai", "premium"], tagline: { en: "Company-wide automation", de: "Unternehmensautomatisierung" }, features: ["Multiple AI agents", "Voice AI", "CRM · ERP integration", "Workflows", "Training"] },
    { id: "ai-care", name: "AI Care", price: "490 €/mo", tags: ["ai", "abo"], tagline: { en: "Ongoing AI care", de: "KI-Betreuung" }, features: ["Updates", "Optimisations", "New prompts", "New features", "Monitoring"] },
    // SEO
    { id: "seo-start", name: "SEO Start", price: "990 €", tags: ["seo"], tagline: { en: "Get found", de: "Gefunden werden" }, features: ["SEO audit", "Keyword research", "Technical optimisation"] },
    { id: "seo-growth", name: "SEO Growth", price: "690 €/mo", tags: ["seo", "abo"], tagline: { en: "Climb the rankings", de: "Rankings erklimmen" }, features: ["Local SEO", "Content", "Reporting", "Linkbuilding"] },
    { id: "seo-domination", name: "SEO Domination", price: "1.490 €/mo", tags: ["seo", "abo", "premium"], tagline: { en: "Own the search results", de: "Beherrsche die Suche" }, features: ["Full SEO", "Local · Technical", "Blog", "Linkbuilding", "Analytics"] },
    // HOSPITALITY
    { id: "hospitality-pro", name: "Hospitality Pro", price: "ab 5.990 €", tags: ["hospitality"], tagline: { en: "For hotels & restaurants", de: "Für Hotels & Gastronomie" }, features: ["Website", "SEO", "Google Business", "Reservation system", "QR reviews", "WhatsApp reminders", "Food shoot", "Cocktail videos"] },
    { id: "hotel-experience", name: "Hotel Experience", price: "ab 9.990 €", tags: ["hospitality", "premium"], tagline: { en: "Premium hotel package", de: "Premium Hotel-Paket" }, features: ["Premium website", "Booking engine", "AI concierge", "Review management", "Events", "Social", "Film production", "Digital signage"], featured: true },
    { id: "restaurant-booster", name: "Restaurant Booster", price: "ab 4.990 €", tags: ["hospitality"], tagline: { en: "Restaurants & bars", de: "Restaurants & Bars" }, features: ["Website", "Reservation", "QR menu", "Food shoot", "Cocktail videos", "Google optimisation"] },
    // PREMIUM COMBOS
    { id: "fashion-edition", name: "Fashion Edition", price: "ab 7.990 €", tags: ["premium"], tagline: { en: "Fashion & beauty launch", de: "Fashion & Beauty Launch" }, features: ["Branding", "Website", "Campaign", "Editorial shoot", "Commercial", "Social launch"] },
    { id: "business-growth", name: "Business Growth", price: "ab 14.990 €", tags: ["premium"], tagline: { en: "Complete marketing", de: "Komplettes Marketing" }, features: ["Branding", "Website", "SEO", "Social", "Paid ads", "Film production"] },
  ] as Tier[],
};

// ── BANDITA BLACK — the flagship retainer ──────────────────────────────────
export const BLACK = {
  kicker: { en: "Bandita Black", de: "Bandita Black" } as Bi,
  heading: { en: "We become your marketing department.", de: "Wir werden eure Marketingabteilung." } as Bi,
  sub: { en: "Everything. No limits. One team on retainer, running your entire brand.", de: "Alles. Ohne Limits. Ein Team im Retainer, das eure ganze Marke steuert." } as Bi,
  price: "ab 5.990 €/mo",
  priceNote: { en: "per month", de: "pro Monat" } as Bi,
  button: { en: "Apply for Bandita Black", de: "Bandita Black anfragen" } as Bi,
  features: [
    "Branding", "Strategy", "Websites", "SEO", "Google Ads", "Social Media",
    "Film Production", "Photography", "Audio Production", "AI Agents",
    "Automations", "Events", "Merchandise", "Recruiting", "Analytics",
    "Dashboards", "24/7 Support", "Production priority", "Monthly strategy workshops",
  ],
};

// ── BANDITA EXCLUSIVES — systems no ordinary agency builds ──────────────────
export const EXCLUSIVES = {
  kicker: { en: "Bandita Exclusives", de: "Bandita Exclusives" } as Bi,
  heading: { en: "Any agency can make a logo. We build systems.", de: "Jede Agentur kann ein Logo bauen. Wir entwickeln Systeme." } as Bi,
  items: [
    "Website AI Concierge", "Custom AI Assistants", "AI Agents for business",
    "3D websites with cinema animation", "Reservation systems with WhatsApp reminders",
    "Add-to-calendar reservations", "Automatic post-visit review requests",
    "Live marketing dashboards", "Social media in 10+ languages",
    "Digital signage for hotels & restaurants", "Interactive menus", "QR experiences",
    "Employer branding systems", "Recruiting funnels", "Marketing automation",
    "CRM integrations", "Customer portals", "24/7 marketing support",
    "Custom business software", "Analytics & KPI dashboards",
  ],
};

// ── ADD-ONS ────────────────────────────────────────────────────────────────
export const ADDONS = {
  kicker: { en: "Add-ons", de: "Add-ons" } as Bi,
  heading: { en: "Bolt anything on.", de: "Beliebig dazubuchbar." } as Bi,
  items: [
    { label: { en: "Drone footage", de: "Drohnenaufnahmen" }, price: "ab 490 €" },
    { label: { en: "FPV drone", de: "FPV-Drohne" }, price: "ab 790 €" },
    { label: { en: "Photo shoot", de: "Fotoshooting" }, price: "ab 890 €" },
    { label: { en: "AI content pack", de: "KI-Content-Paket" }, price: "ab 990 €" },
    { label: { en: "3D animations", de: "3D-Animationen" }, price: "ab 1.490 €" },
    { label: { en: "Motion design", de: "Motion Design" }, price: "ab 990 €" },
    { label: { en: "Digital signage", de: "Digital Signage" }, price: "ab 1.990 €" },
    { label: { en: "Reservation system", de: "Reservierungssystem" }, price: "ab 1.490 €" },
    { label: { en: "WhatsApp automation", de: "WhatsApp-Automatisierung" }, price: "ab 990 €" },
    { label: { en: "Review automation", de: "Bewertungsautomatisierung" }, price: "ab 690 €" },
    { label: { en: "Extra language (per language)", de: "Mehrsprachige Website (je Sprache)" }, price: "ab 490 €" },
    { label: { en: "Maintenance & support", de: "Wartung & Support" }, price: "ab 149 €/mo" },
  ],
};

// ── "and more" marquee ─────────────────────────────────────────────────────
export const MORE = {
  kicker: { en: "And there's more.", de: "Und da ist noch mehr." } as Bi,
  items: ["Performance Marketing", "Google Ads", "Meta Ads", "TikTok Ads", "Events", "Merchandise", "Print Design", "Packaging", "Recruiting Funnels", "Employer Branding"],
};

// ── PROCESS ────────────────────────────────────────────────────────────────
export const PROCESS = {
  kicker: { en: "How we work", de: "So arbeiten wir" } as Bi,
  heading: { en: "No guessing. A method.", de: "Kein Raten. Eine Methode." } as Bi,
  steps: [
    { num: "01", title: { en: "Understand", de: "Verstehen" } as Bi, body: { en: "We dig into your business, market and customers — before a single pixel.", de: "Wir tauchen in dein Business, deinen Markt und deine Kunden ein — vor dem ersten Pixel." } as Bi },
    { num: "02", title: { en: "Strategy", de: "Strategie" } as Bi, body: { en: "Positioning built on psychology. Reasons to buy, not just things to look at.", de: "Positionierung auf Basis von Psychologie. Gründe zu kaufen, nicht nur Dinge zum Anschauen." } as Bi },
    { num: "03", title: { en: "Creation", de: "Kreation" } as Bi, body: { en: "Brand, content, film, web, sound, AI — produced in-house, handwriting you can see.", de: "Brand, Content, Film, Web, Sound, KI — inhouse produziert, mit einer Handschrift, die man sieht." } as Bi },
    { num: "04", title: { en: "Launch & Scale", de: "Launch & Skalierung" } as Bi, body: { en: "We ship, measure and grow it. Likes fade. Memories stay — and so do we.", de: "Wir launchen, messen und skalieren. Likes verschwinden. Erinnerungen bleiben — und wir auch." } as Bi },
  ],
};

// ── CLOSING ────────────────────────────────────────────────────────────────
export const CLOSE = {
  heading: { en: "Ready to steal attention?", de: "Bereit, Aufmerksamkeit zu stehlen?" } as Bi,
  line1: { en: "Your competitors won't like us.", de: "Deine Konkurrenz wird uns nicht mögen." } as Bi,
  line2: { en: "Your customers will.", de: "Deine Kunden schon." } as Bi,
  button: { en: "Start your project", de: "Projekt starten" } as Bi,
};

// ── TAILORED-OFFER call to action (used across the page) ───────────────────
export const OFFER = {
  cta: { en: "Request your tailored offer", de: "Maßgeschneidertes Angebot anfordern" } as Bi,
  ctaShort: { en: "Tailored offer", de: "Maßgeschneidertes Angebot" } as Bi,
  bandKicker: { en: "As individual as your brand", de: "So individuell wie deine Marke" } as Bi,
  bandHeading: {
    en: "No two brands are the same. Neither are our offers.",
    de: "Keine Marke ist wie die andere. Kein Angebot auch.",
  } as Bi,
  bandSub: {
    en: "Tell us your goal — we build a package around it. Free and non-binding.",
    de: "Sag uns dein Ziel — wir schnüren das Paket drumherum. Gratis und unverbindlich.",
  } as Bi,
};

// ── QUOTE MODAL — tailored-offer request form ──────────────────────────────
export const QUOTE = {
  title: { en: "Build your offer — with a price.", de: "Stell dir dein Angebot zusammen — mit Preis." } as Bi,
  subtitle: {
    en: "Non-binding. Tell us your business, your goal and what you need — we build an individual offer with a price and reply within 48 hours.",
    de: "Unverbindlich. Sag uns dein Business, dein Ziel und was du brauchst — wir stellen dir ein individuelles Angebot mit Preis zusammen und melden uns innerhalb von 48 Stunden.",
  } as Bi,
  qServices: { en: "Which services do you need?", de: "Welche Leistungen brauchst du?" } as Bi,
  qGoal: { en: "Your main goal", de: "Dein wichtigstes Ziel" } as Bi,
  qBusiness: { en: "Your type of business", de: "Deine Betriebsart" } as Bi,
  qCompany: { en: "Company", de: "Firma" } as Bi,
  qWebsite: { en: "Website / Instagram (optional)", de: "Website / Instagram (optional)" } as Bi,
  qName: { en: "Name", de: "Name" } as Bi,
  qEmail: { en: "Email", de: "E-Mail" } as Bi,
  qPhone: { en: "Phone (for a callback)", de: "Telefon (für einen Rückruf)" } as Bi,
  qMessage: { en: "Your wishes (optional)", de: "Deine Wünsche (optional)" } as Bi,
  submit: { en: "Request my offer", de: "Angebot anfordern" } as Bi,
  note: { en: "Non-binding · We reply within 48 hours.", de: "Unverbindlich · Antwort innerhalb von 48 Stunden." } as Bi,
  required: { en: "Please add an email or phone number so we can reach you.", de: "Bitte E-Mail oder Telefon angeben, damit wir dich erreichen." } as Bi,
  success: {
    en: "Thanks! Your mail app just opened with your request — hit send and we'll come back within 48 hours with your individual offer.",
    de: "Danke! Dein Mail-Programm hat sich mit deiner Anfrage geöffnet — einmal senden, und wir melden uns innerhalb von 48 Stunden mit deinem individuellen Angebot.",
  } as Bi,
  successPhone: {
    en: "Prefer a call? We'll ring you back — or reach us any time at",
    de: "Lieber telefonisch? Wir rufen zurück — oder erreich uns jederzeit unter",
  } as Bi,
  services: [
    { key: "brand", label: { en: "Branding", de: "Branding" } },
    { key: "social", label: { en: "Social Media", de: "Social Media" } },
    { key: "film", label: { en: "Film Production", de: "Filmproduktion" } },
    { key: "photo", label: { en: "Photography", de: "Fotografie" } },
    { key: "web", label: { en: "Web & 3D", de: "Web & 3D" } },
    { key: "audio", label: { en: "Music & Audio", de: "Musik & Audio" } },
    { key: "seo", label: { en: "SEO & Growth", de: "SEO & Growth" } },
    { key: "ai", label: { en: "AI Content", de: "AI Content" } },
    { key: "events", label: { en: "Events", de: "Events" } },
    { key: "merch", label: { en: "Merchandise", de: "Merchandise" } },
    { key: "fullservice", label: { en: "Full-Service / Bandita Black", de: "Full-Service / Bandita Black" } },
    { key: "unsure", label: { en: "Not sure yet", de: "Weiß ich noch nicht" } },
  ] as { key: string; label: Bi }[],
  goals: [
    { en: "More visibility & reach", de: "Mehr Sichtbarkeit & Reichweite" },
    { en: "More revenue & sales", de: "Mehr Umsatz & Verkäufe" },
    { en: "New brand / rebranding", de: "Neue Marke / Rebranding" },
    { en: "More bookings / reservations", de: "Mehr Buchungen / Reservierungen" },
    { en: "Recruiting & employer branding", de: "Recruiting & Employer Branding" },
    { en: "Launch / market entry", de: "Launch / Markteintritt" },
    { en: "Not sure yet", de: "Weiß ich noch nicht" },
  ] as Bi[],
  businessTypes: [
    { en: "Hotel / Accommodation", de: "Hotel / Beherbergung" },
    { en: "Restaurant / Bar / Café", de: "Restaurant / Bar / Café" },
    { en: "Fashion / Beauty", de: "Fashion / Beauty" },
    { en: "Retail / E-Commerce", de: "Handel / E-Commerce" },
    { en: "Service / B2B", de: "Dienstleister / B2B" },
    { en: "Real Estate", de: "Immobilien" },
    { en: "Startup", de: "Startup" },
    { en: "Event / Entertainment", de: "Event / Entertainment" },
    { en: "Other", de: "Sonstiges" },
  ] as Bi[],
};
