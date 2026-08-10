// Netlify Image CDN helper. In production, routes an image through
// /.netlify/images for on-the-fly resize + WebP/AVIF negotiation (big savings on
// large photos). In dev it returns the raw src so images still load without the
// Netlify runtime.
//
// SCOPE — use this ONLY on images that are NOT `data-cms` elements (e.g. the hero
// CSS background). Do NOT wrap the `src` of a data-cms/​data-cms-field/​gallery
// image: the visual editor reads and writes that src back to content.js, so a
// transformed URL would get saved and then double-wrapped. Client-uploaded images
// (gallery/team/story) are optimised centrally at UPLOAD time in the CMS instead.
//
// GOTCHA (learned the hard way): NEVER pass fit=cover with width only — it keeps
// the source height and slices the width (distorts the image). Resize by width,
// preserve aspect, let CSS object-fit / background-size do the framing. Only pass
// `fit` when BOTH width and height are given.
const isProd = import.meta.env.PROD

export function img(src, { w, h, q = 74, fit } = {}) {
  if (!src || src.startsWith('data:')) return src
  if (!isProd) return src
  const p = new URLSearchParams()
  p.set('url', src)
  if (w) p.set('w', String(w))
  if (h) p.set('h', String(h))
  p.set('q', String(q))
  if (fit && w && h) p.set('fit', fit) // safe only with both dims — see gotcha
  return `/.netlify/images?${p.toString()}`
}
