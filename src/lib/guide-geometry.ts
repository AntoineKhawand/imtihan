/** Clip the highlight to visible content, excluding the mobile guide sheet. */
export function guideSpot(
  rect: { top: number; left: number; right: number; bottom: number },
  viewportWidth: number,
  visibleBottom: number,
) {
  const top = Math.max(4, rect.top - 6);
  const left = Math.max(4, rect.left - 6);
  const right = Math.min(viewportWidth - 4, rect.right + 6);
  const bottom = Math.min(visibleBottom - 4, rect.bottom + 6);
  if (right <= left || bottom <= top) return null;
  return { top, left, width: right - left, height: bottom - top };
}
