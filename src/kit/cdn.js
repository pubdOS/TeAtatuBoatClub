// ── Image CDN ──
// Netlify's Image CDN (/.netlify/images) resizes a photo on the fly and serves
// it as AVIF or WebP to browsers that take them (it reads the Accept header).
// A site's photos are stored at full size, which is right for a big screen and
// wasteful on a phone: a hero straight from public/images was 350 KB to 2 MB of
// JPEG, and on a phone it was most of what Google's speed test waited for.
//
// SCOPE: only a photo the editor does NOT read. A `data-cms` / `data-cms-field`
// image's src is read and written back to content.js by the visual editor, so a
// CDN address there would be saved and then wrapped twice. The visible hero
// photo (HeroPhotos) is safe: its field lives on a hidden companion, and the
// bridge knows a CDN address carries the source in `url` (cdnSource).
//
// In dev it returns the plain address, so photos load without Netlify.
// Part of the shared kit: synced to every site from sitemog-starter.
//
// GOTCHA (learned the hard way): NEVER pass fit=cover with a width only: it
// keeps the source height and slices the width (distorts the photo). Resize by
// width, keep the aspect, let CSS object-fit do the framing. Only pass `fit`
// when BOTH width and height are given.
import { bare } from './framing.js'

const isProd = import.meta.env.PROD

/** Widths a responsive photo is offered at: a phone (1x to 3x), a tablet, a laptop, a big screen. */
export const WIDTHS = [480, 828, 1200, 1920, 2560]

/** One CDN address for a photo, or the photo itself when the CDN cannot serve it. */
export function cdn(src, { w, h, q = 74, fit } = {}) {
  src = bare(src)
  if (!src || /^(data|blob):/.test(src)) return src
  if (!isProd) return src
  const p = new URLSearchParams()
  p.set('url', src)
  if (w) p.set('w', String(w))
  if (h) p.set('h', String(h))
  p.set('q', String(q))
  if (fit && w && h) p.set('fit', fit) // safe only with both dims, see the gotcha
  return `/.netlify/images?${p.toString()}`
}

/** A srcset of the photo at each width, for `<img srcset sizes>`; undefined in dev. */
export function cdnSet(src, { widths = WIDTHS, q } = {}) {
  const s = bare(src)
  if (!isProd || !s || /^(data|blob):/.test(s)) return undefined
  return widths.map((w) => `${cdn(s, { w, q })} ${w}w`).join(', ')
}
