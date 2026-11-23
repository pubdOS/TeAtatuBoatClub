// Netlify Image CDN helper, for the pages. The CDN itself lives with the kit
// (src/kit/cdn.js, shared, synced from sitemog-starter): `img` is its `cdn`,
// `imgSet` its `cdnSet`. Read the SCOPE note there before using either: never
// on the src of a data-cms / data-cms-field / gallery image (the editor writes
// that src back to content.js). Client uploads are optimised at upload time.
export { cdn as img, cdnSet as imgSet, WIDTHS } from '../kit/cdn.js'

// Photo framing lives with the kit (src/kit/framing.js); re-exported here for
// the pages that import it from this file.
export { framingOf, bare, frame, frameBg, framed, framedBg } from '../kit/framing.js'
