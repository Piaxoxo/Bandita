import Image from "next/image";
import { dimsOf } from "@/lib/image-dimensions";

/*
  A still in a project chapter — the one place on the site where the image's
  own aspect ratio is the layout.

  Everywhere else the box is fixed by CSS and next/image can use `fill`. Here
  the sets mix portrait and landscape in one column, so the real pixel size has
  to come from the file. lib/image-dimensions.ts carries it, measured at build
  time; anything missing from that map falls back to a plain <img>, which is
  what these were before and is never worse than not rendering.

  `h-auto` matters: with width/height attributes present, leaving the height to
  CSS `auto` is what keeps the browser using the aspect ratio instead of the
  literal pixel height.
*/
export default function ProjectImage({
  src,
  alt,
  priority = false,
  className = "w-full bg-[#0d0b0e] object-contain",
  sizes = "(min-width: 1300px) 1300px, 100vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const d = dimsOf(src);

  if (!d) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={d.width}
      height={d.height}
      sizes={sizes}
      priority={priority}
      className={`h-auto ${className}`}
    />
  );
}
