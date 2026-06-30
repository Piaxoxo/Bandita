// Portfolio journey content — order locked: photo · photo · FILM · photo · photo · FILM · photo · photo.
// Purely visual: only tiny client tags + floating advertising quotes. No project copy.

export type Bi = { en: string; de: string };

export type RevealStyle = "develop" | "rise" | "spin" | "glass" | "screen" | "bloom";

export type Station = {
  id: string;
  kind: "photo" | "video";
  images: string[]; // still frames (also posters for video)
  video?: string[]; // optional video sources (muted, in-focus only)
  orientation: "landscape" | "portrait";
  tag: Bi; // tiny label
  color: string; // mood accent (light/fog tint, rim)
  side: -1 | 0 | 1; // base horizontal bias
  y: number; // base vertical offset
  reveal: RevealStyle; // bespoke entrance per station
};

export const STATIONS: Station[] = [
  {
    id: "wiener-restaurant",
    kind: "photo",
    images: ["/portfolio/wiener-restaurant/01.jpg", "/portfolio/wiener-restaurant/02.jpg"],
    orientation: "portrait",
    tag: { en: "Fine Dining · Vienna", de: "Fine Dining · Wien" },
    color: "#E8B27A",
    reveal: "glass",
    side: -1,
    y: 0.2,
  },
  {
    id: "innsider",
    kind: "photo",
    images: [
      "/portfolio/innsider/01.jpg",
      "/portfolio/innsider/02.jpg",
      "/portfolio/innsider/03.jpg",
    ],
    orientation: "landscape",
    tag: { en: "Inn|Sider · Restaurant & Bar", de: "Inn|Sider · Restaurant & Bar" },
    color: "#FF7A4D",
    reveal: "develop",
    side: 1,
    y: -0.3,
  },
  {
    id: "deutschland",
    kind: "video",
    images: ["/portfolio/video/deutschland-gta-poster.jpg"],
    video: ["/portfolio/video/deutschland-gta.mp4"],
    orientation: "landscape",
    tag: { en: "Travel Film · Germany", de: "Travel Film · Deutschland" },
    color: "#FB003F",
    reveal: "screen",
    side: 0,
    y: 0,
  },
  {
    id: "wiener-bar",
    kind: "photo",
    images: [
      "/portfolio/wiener-bar/01.jpg",
      "/portfolio/wiener-bar/02.jpg",
      "/portfolio/wiener-bar/03.jpg",
      "/portfolio/wiener-bar/04.jpg",
    ],
    orientation: "landscape",
    tag: { en: "Bar · Vienna", de: "Bar · Wien" },
    color: "#FF4E8E",
    reveal: "spin",
    side: -1,
    y: 0.3,
  },
  {
    id: "kern",
    kind: "photo",
    images: ["/portfolio/kern/01.jpg", "/portfolio/kern/02.jpg", "/portfolio/kern/03.jpg"],
    orientation: "portrait",
    tag: { en: "Kern · Hospitality", de: "Kern · Hospitality" },
    color: "#7FB0C9",
    reveal: "rise",
    side: 1,
    y: 0.1,
  },
  {
    id: "portugal",
    kind: "video",
    images: [
      "/portfolio/video/portugal-reel-01-poster.jpg",
      "/portfolio/video/portugal-reel-02-poster.jpg",
    ],
    video: ["/portfolio/video/portugal-reel-01.mp4", "/portfolio/video/portugal-reel-02.mp4"],
    orientation: "portrait",
    tag: { en: "Travel Reels · Portugal", de: "Travel Reels · Portugal" },
    color: "#36C2B4",
    reveal: "screen",
    side: 0,
    y: 0,
  },
  {
    id: "besser-reisen",
    kind: "photo",
    images: [
      "/portfolio/besser-reisen/01.jpg",
      "/portfolio/besser-reisen/02.jpg",
      "/portfolio/besser-reisen/03.jpg",
    ],
    orientation: "landscape",
    tag: { en: "Besser Reisen · Skopje", de: "Besser Reisen · Skopje" },
    color: "#E7C66B",
    reveal: "bloom",
    side: -1,
    y: -0.2,
  },
  {
    id: "tourism-international",
    kind: "photo",
    images: [
      "/portfolio/tourism-international/01.jpg",
      "/portfolio/tourism-international/02.jpg",
      "/portfolio/tourism-international/03.jpg",
    ],
    orientation: "landscape",
    tag: { en: "International · Travel", de: "International · Travel" },
    color: "#C9A2FF",
    reveal: "develop",
    side: 1,
    y: 0.2,
  },
];

// Flattened journey: every image / video gets its own clean head-on frame,
// grouped by project (mood colour, reveal style, tag, sound carry over).
export type Item = {
  station: Station;
  stationIndex: number;
  src: string;
  isVideo: boolean;
  first: boolean; // first frame of its project group
};

export const ITEMS: Item[] = STATIONS.flatMap((st, si) => {
  const media = st.video
    ? st.video.map((src) => ({ src, isVideo: true }))
    : st.images.map((src) => ({ src, isVideo: false }));
  return media.map((m, k) => ({ station: st, stationIndex: si, src: m.src, isVideo: m.isVideo, first: k === 0 }));
});

// Provocative advertising quotes — Bandita voice, the only typography in the void.
export const QUOTES: Bi[] = [
  { en: "Ordinary is expensive.", de: "Gewöhnlich ist teuer." },
  { en: "Attention is the only currency.", de: "Aufmerksamkeit ist die einzige Währung." },
  { en: "Beautiful isn't enough.", de: "Schön ist nicht genug." },
  { en: "If they scroll past, you paid for nothing.", de: "Wer weiterscrollt, war umsonst bezahlt." },
  { en: "The eye buys first.", de: "Das Auge kauft zuerst." },
  { en: "We don't decorate. We capture.", de: "Wir dekorieren nicht. Wir fesseln." },
  { en: "Make them remember.", de: "Bleib unvergesslich." },
  { en: "Stop blending in.", de: "Hör auf, dich anzupassen." },
];
