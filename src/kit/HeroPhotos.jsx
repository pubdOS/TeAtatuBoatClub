import { useEffect, useState } from 'react'
import { framed } from './framing.js'

// The hero's photos: the hero's own photo, then any more the client added
// (`more`, a list of { image }). One photo is drawn exactly as a single hero
// photo always was. With more, they take turns: each holds for a few seconds,
// then the next fades in over it. Never for someone who has asked for less
// motion (they see the first), and never while the tab is out of sight.
//
// The first photo is the page's largest paint, so it is the only one drawn by
// the server; the rest mount after load and cost nothing up front. `srcFor`
// lets a site pass each address through its image CDN.
//
// The box (position, size, dimming) is the site's: pass it as className. Dim
// the BOX (opacity, a filter), never a photo: each photo's own opacity runs the
// fade. Each photo's other classes (object-cover is set) go in imgClassName.
// Part of the shared kit: synced to every site from sitemog-starter.
export default function HeroPhotos({ image, more, className = '', imgClassName = '', srcFor = (s) => s, hold = 6000 }) {
  const photos = [image, ...(Array.isArray(more) ? more.map((x) => x?.image) : [])].filter((s) => typeof s === 'string' && s)
  const [shown, setShown] = useState(0)
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  useEffect(() => {
    if (photos.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => { if (!document.hidden) setShown((i) => (i + 1) % photos.length) }, hold)
    return () => clearInterval(t)
  }, [photos.length, hold])
  const at = shown % Math.max(1, photos.length)
  return (
    <div className={`kit-hero-photos ${className}`} aria-hidden="true">
      {photos.map((src, i) => (i === 0 || ready) && (
        <img key={src + i} src={srcFor(src)} alt="" loading={i === 0 ? 'eager' : 'lazy'} fetchpriority={i === 0 ? 'high' : undefined}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
          {...framed(src, { opacity: i === at ? 1 : 0 })} />
      ))}
    </div>
  )
}
