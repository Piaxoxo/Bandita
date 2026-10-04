/*
  The headline entrances slide letters up from below their line, and the line
  wrapper's `overflow: hidden` is what hides them until they arrive.

  That mask only has a job WHILE the letters travel. Left in place afterwards
  it keeps clipping the resting type — and because these headlines run a
  line-height below 1, the descenders of g, y, p and j fall outside the line
  box and get sliced off flat. ("gestern." lost about a quarter of an em.)

  So: once the reveal has finished, drop the mask. Layout is untouched —
  `overflow` does not affect it — and the glyphs get their tails back.
*/
export function unmaskLines(root: ParentNode | null | undefined, selector: string) {
  if (!root) return;
  root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.style.overflow = "visible";
  });
}
