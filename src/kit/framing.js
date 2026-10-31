// ── Photo framing ──
// A client can choose which part of a photo stays in view, and zoom in, from
// the CMS. The choice rides on the photo's own address as a fragment,
// `photo.jpg#f=0.42,0.3,1.25` (focus across, focus down, zoom), so it needs no
// extra field and the file itself is never cropped: a browser never sends the
// fragment, so the same file serves every screen. The focus point stays in
// view whatever shape the slot takes (wide on a laptop, tall on a phone).
// Contract: sitemog-toolkit/EDITOR_CONTRACT.md "Photo framing". Part of the
// shared kit: synced to every site from sitemog-starter, never edited per site.

/** { x, y, zoom } from a photo's address, or null when it has none. */
export function framingOf(src) {
  const m = typeof src === 'string' && src.match(/#f=([\d.]+),([\d.]+)(?:,([\d.]+))?$/)
  if (!m) return null
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
  return { x: clamp(+m[1], 0, 1), y: clamp(+m[2], 0, 1), zoom: clamp(+(m[3] ?? 1), 1, 4) }
}

/** The address without its framing, for anything that fetches it. */
export const bare = (src) => (typeof src === 'string' ? src.replace(/#f=[\d.,]+$/, '') : src)

/** Styles for an <img> that fills its box (object-cover). The box must clip
 *  (overflow-hidden, or a rounded frame) for a zoom to stay inside it. */
export function frame(src, style) {
  const f = framingOf(src)
  if (!f) return style
  const at = `${+(f.x * 100).toFixed(2)}% ${+(f.y * 100).toFixed(2)}%`
  return { ...style, objectPosition: at, ...(f.zoom > 1 ? { transform: `scale(${f.zoom})`, transformOrigin: at } : {}) }
}

/** The same for a layer painted with a cover background. */
export function frameBg(src, style) {
  const f = framingOf(src)
  if (!f) return style
  const at = `${+(f.x * 100).toFixed(2)}% ${+(f.y * 100).toFixed(2)}%`
  return { ...style, backgroundPosition: at, ...(f.zoom > 1 ? { transform: `scale(${f.zoom})`, transformOrigin: at } : {}) }
}

/** Props for a photo slot that draws its framing: the styles, and the mark
 *  that tells the editor this slot can be framed (only marked slots are
 *  offered, so a site never shows a framing it does not draw). */
export const framed = (src, style) => ({ style: frame(src, style), 'data-cms-framed': '' })
export const framedBg = (src, style) => ({ style: frameBg(src, style), 'data-cms-framed': '' })
