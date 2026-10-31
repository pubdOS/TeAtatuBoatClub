import { useState, useMemo } from 'react'
import c from '../../content.js'
import Seo from '../components/Seo.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import Lightbox from '../components/Lightbox.jsx'
import Sections, { Section } from '../components/Sections.jsx'

// Resolve a gallery item to an image src — tolerates the content.js seed shape
// ({ image }), the CMS gallery shape ({ url, album }), or a plain string.
const itemSrc = (item) => (typeof item === 'string' ? item : item.url || item.image)
// A photo's album key (string items / seed { image } have none → 'all').
const itemAlbum = (item) => (typeof item === 'object' && item.album ? item.album : 'all')
// Pretty label from an album key: "65th-anniversary" → "65th Anniversary".
const labelFor = (key) =>
  key.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function Gallery() {
  const [active, setActive] = useState(null)
  const [album, setAlbum] = useState('all')

  // Build the album tab list from the photos themselves (the office manages
  // albums in the CMS; once published they arrive on each photo as `album`).
  const albums = useMemo(() => {
    const keys = [...new Set(c.gallery_photos.map(itemAlbum).filter((a) => a && a !== 'all'))]
    return [{ key: 'all', label: 'All' }, ...keys.map((k) => ({ key: k, label: labelFor(k) }))]
  }, [])

  const visible = useMemo(
    () => (album === 'all' ? c.gallery_photos : c.gallery_photos.filter((p) => itemAlbum(p) === album)),
    [album],
  )
  const srcs = useMemo(() => visible.map(itemSrc), [visible])

  return (
    <>
      <Seo title={c.gallery_seo_title} description={c.gallery_seo_description} />
      <span hidden data-cms="Gallery - SEO - Page Title">{c.gallery_seo_title}</span>
      <span hidden data-cms="Gallery - SEO - Meta Description">{c.gallery_seo_description}</span>
      <span hidden data-cms="Gallery - Page - Layout">{c.gallery_page_layout}</span>
      <span hidden data-cms="Gallery - Page - Kit">{c.gallery_page_kit}</span>
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Gallery - Hero - Heading">
            {c.gallery_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Gallery - Hero - Sub">{c.gallery_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      <Sections layout={c.gallery_page_layout} tones={["base", "alt"]} page="Gallery" kit={c.gallery_page_kit}>
      <Section id="Gallery - Photos">
      <div className="section">
        {/* Album filter tabs — only shown when the office has created albums. */}
        {albums.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {albums.map((a) => (
              <button
                key={a.key}
                onClick={() => { setAlbum(a.key); setActive(null) }}
                className={
                  album === a.key
                    ? 'rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition'
                    : 'rounded-full bg-sea px-5 py-2 text-sm font-semibold text-navy/70 transition hover:bg-sand'
                }
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic gallery — the office manages photos + albums from the CMS.
            Seeded from content.js (gallery_photos) on first scan. IMPORTANT: the
            grid must map over `c.gallery_photos` directly — that's how the CMS
            scanner detects which content.js array backs this gallery (so Publish
            writes photo/album edits back here). Album filtering is done by
            skipping non-matching photos, not by mapping a pre-filtered array. */}
        <div
          data-cms-gallery="Gallery - Photos"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        >
          {c.gallery_photos.map((item, i) => {
            if (album !== 'all' && itemAlbum(item) !== album) return null
            const lightboxIdx = visible.indexOf(item)
            return (
              <div
                key={i}
                role="button"
                tabIndex={0}
                aria-label="View photo"
                onClick={() => setActive(lightboxIdx)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(lightboxIdx) } }}
                className="group cursor-zoom-in overflow-hidden rounded-xl bg-navy/5 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <img
                  src={itemSrc(item)}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )
          })}
        </div>
      </div>
      </Section>
      </Sections>

      <Lightbox items={srcs} index={active} setIndex={setActive} />
    </>
  )
}
