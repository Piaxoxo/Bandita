// Portfolio content — organised as named projects. The overview ("wall") shows
// every project by name; opening one drops you into its own cinematic chapter.

export type Bi = { en: string; de: string };

export type Station = {
  id: string;
  kind: "photo" | "video";
  name: Bi; // big display name (shown on the wall + as the chapter title)
  tag: Bi; // small descriptor line
  note?: Bi; // optional cheeky one-liner shown in the chapter
  images: string[]; // still frames (also posters for video)
  video?: string[]; // optional video sources (muted, plays in the chapter)
  cover?: string; // wall cover (defaults to images[0])
  orientation: "landscape" | "portrait" | "square";
  color: string; // mood accent (rim, glow, fog tint)
};

export const STATIONS: Station[] = [
  {
    id: "plein",
    kind: "photo",
    name: { en: "Philipp Plein", de: "Philipp Plein" },
    tag: { en: "Fashion Campaign", de: "Fashion Kampagne" },
    images: ["/portfolio/plein/01.jpg", "/portfolio/plein/02.jpg", "/portfolio/plein/03.jpg"],
    orientation: "square",
    color: "#D24BFF",
  },
  {
    id: "product",
    kind: "photo",
    name: { en: "Product Shooting", de: "Product Shooting" },
    tag: { en: "Still Life · Studio", de: "Still Life · Studio" },
    note: {
      en: "Yes, photographed. Not AI-generated. We do both.",
      de: "Ja, fotografiert. Nicht KI-generiert. Wir können beides.",
    },
    images: [
      "/portfolio/product/01.jpg",
      "/portfolio/product/02.jpg",
      "/portfolio/product/03.jpg",
      "/portfolio/product/04.jpg",
    ],
    orientation: "landscape",
    color: "#F0243C",
  },
  {
    id: "publikationen",
    kind: "photo",
    name: { en: "Publications", de: "Publikationen" },
    tag: { en: "Press · Editorial", de: "Presse · Editorial" },
    images: [
      "/portfolio/publikationen/01.jpg",
      "/portfolio/publikationen/02.jpg",
      "/portfolio/publikationen/03.jpg",
    ],
    orientation: "portrait",
    color: "#A88BEB",
  },
  {
    id: "innsider",
    kind: "photo",
    name: { en: "Inn|Sider", de: "Inn|Sider" },
    tag: { en: "Restaurant & Bar · Vienna", de: "Restaurant & Bar · Wien" },
    images: ["/portfolio/innsider/01.jpg", "/portfolio/innsider/02.jpg", "/portfolio/innsider/03.jpg"],
    orientation: "landscape",
    color: "#FF7A4D",
  },
  {
    id: "hotel",
    kind: "photo",
    name: { en: "Hotel & Restaurant", de: "Hotel & Restaurant" },
    tag: { en: "Social Media Content", de: "Social Media Content" },
    images: [
      "/portfolio/hotel/01.jpg",
      "/portfolio/hotel/02.jpg",
      "/portfolio/hotel/03.jpg",
      "/portfolio/hotel/04.jpg",
      "/portfolio/hotel/05.jpg",
      "/portfolio/hotel/06.jpg",
      "/portfolio/hotel/07.jpg",
      "/portfolio/hotel/08.jpg",
    ],
    video: ["/portfolio/hotel/reel.mp4"],
    orientation: "landscape",
    color: "#E1A15C",
  },
  {
    id: "website",
    kind: "photo",
    name: { en: "Restaurant Website", de: "Restaurant Website" },
    tag: { en: "Website Shooting", de: "Website Shooting" },
    images: [
      "/portfolio/website/01.jpg",
      "/portfolio/website/02.jpg",
      "/portfolio/website/03.jpg",
      "/portfolio/website/04.jpg",
      "/portfolio/website/05.jpg",
    ],
    orientation: "landscape",
    color: "#5CA8D6",
  },
  {
    id: "cocktail",
    kind: "photo",
    name: { en: "Cocktails", de: "Cocktails" },
    tag: { en: "Bar & Beverage", de: "Bar & Beverage" },
    images: ["/portfolio/cocktail/01.jpg", "/portfolio/cocktail/02.jpg"],
    orientation: "portrait",
    color: "#C98A3E",
  },
  {
    id: "wiener-bar",
    kind: "photo",
    name: { en: "Vienna Bar", de: "Wiener Bar" },
    tag: { en: "Bar · Vienna", de: "Bar · Wien" },
    images: [
      "/portfolio/wiener-bar/01.jpg",
      "/portfolio/wiener-bar/02.jpg",
      "/portfolio/wiener-bar/03.jpg",
      "/portfolio/wiener-bar/04.jpg",
    ],
    orientation: "landscape",
    color: "#FF4E8E",
  },
  {
    id: "deutschland",
    kind: "video",
    name: { en: "Germany", de: "Deutschland" },
    tag: { en: "Travel Film", de: "Travel Film" },
    images: ["/portfolio/video/deutschland-gta-poster.jpg"],
    video: ["/portfolio/video/deutschland-gta.mp4"],
    orientation: "landscape",
    color: "#FB003F",
  },
  {
    id: "wiener-restaurant",
    kind: "photo",
    name: { en: "Fine Dining", de: "Fine Dining" },
    tag: { en: "Restaurant · Vienna", de: "Restaurant · Wien" },
    images: ["/portfolio/wiener-restaurant/01.jpg", "/portfolio/wiener-restaurant/02.jpg"],
    orientation: "portrait",
    color: "#E8B27A",
  },
  {
    id: "kern",
    kind: "photo",
    name: { en: "Kern", de: "Kern" },
    tag: {
      en: "Social Media Content · Beherbergungsbetriebs GmbH",
      de: "Social Media Content · Beherbergungsbetriebs GmbH",
    },
    images: ["/portfolio/kern/01.jpg", "/portfolio/kern/02.jpg", "/portfolio/kern/03.jpg"],
    orientation: "portrait",
    color: "#7FB0C9",
  },
  {
    id: "portugal",
    kind: "video",
    name: { en: "Portugal", de: "Portugal" },
    tag: { en: "Travel Reels", de: "Travel Reels" },
    images: [
      "/portfolio/video/portugal-reel-01-poster.jpg",
      "/portfolio/video/portugal-reel-02-poster.jpg",
    ],
    video: ["/portfolio/video/portugal-reel-01.mp4", "/portfolio/video/portugal-reel-02.mp4"],
    orientation: "portrait",
    color: "#36C2B4",
  },
  {
    id: "besser-reisen",
    kind: "photo",
    name: { en: "Besser Reisen", de: "Besser Reisen" },
    tag: { en: "Campaign · Skopje", de: "Kampagne · Skopje" },
    images: [
      "/portfolio/besser-reisen/01.jpg",
      "/portfolio/besser-reisen/02.jpg",
      "/portfolio/besser-reisen/03.jpg",
    ],
    orientation: "landscape",
    color: "#E7C66B",
  },
  {
    id: "tourism-international",
    kind: "photo",
    name: { en: "Tourism Int.", de: "Tourism Int." },
    tag: { en: "Travel · International", de: "Travel · International" },
    images: [
      "/portfolio/tourism-international/01.jpg",
      "/portfolio/tourism-international/02.jpg",
      "/portfolio/tourism-international/03.jpg",
    ],
    orientation: "landscape",
    color: "#C9A2FF",
  },
];

export type Media = { src: string; isVideo: boolean; poster?: string };

// Ordered media for a project's chapter. Pure video projects play their reels
// (posters from images[]); photo projects show their stills plus any appended
// reel (poster derived by "-poster.jpg" convention).
export function projectMedia(st: Station): Media[] {
  if (st.kind === "video" && st.video) {
    return st.video.map((src, i) => ({ src, isVideo: true, poster: st.images[i] ?? st.images[0] }));
  }
  const photos: Media[] = st.images.map((src) => ({ src, isVideo: false }));
  const vids: Media[] = (st.video ?? []).map((src) => ({
    src,
    isVideo: true,
    poster: src.replace(/\.mp4$/, "-poster.jpg"),
  }));
  return [...photos, ...vids];
}

export const coverOf = (st: Station) => st.cover ?? st.images[0];
export const mediaCount = (st: Station) => projectMedia(st).length;

// Provocative advertising quotes — Bandita voice, used as ambient interludes.
export const QUOTES: Bi[] = [
  { en: "Ordinary is expensive.", de: "Gewöhnlich ist teuer." },
  { en: "Attention is the only currency.", de: "Aufmerksamkeit ist die einzige Währung." },
  { en: "Beautiful isn't enough.", de: "Schön ist nicht genug." },
  { en: "The eye buys first.", de: "Das Auge kauft zuerst." },
  { en: "We don't decorate. We capture.", de: "Wir dekorieren nicht. Wir fesseln." },
  { en: "Make them remember.", de: "Bleib unvergesslich." },
];
