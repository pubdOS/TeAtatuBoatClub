import { Head } from 'vite-react-ssg'
import { useLocation } from 'react-router-dom'
import c from '../../content.js'

// Absolute-URL helper: pass a path through unchanged if already absolute, else
// prefix the site's canonical base (content.js `url`).
const base = (c.url || '').replace(/\/$/, '')
const abs = (u) => {
  if (!u) return ''
  if (/^https?:\/\//.test(u)) return u
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`
}

// Per-page SEO head (Rule 15) — now PRERENDERED into the static HTML, not set by a
// client-side effect. Emits title + description + a self-referencing canonical +
// per-page Open Graph / Twitter (fixing the old bug where OG tags stayed frozen on
// the homepage values across every route). Driven by the page's content.js keys;
// pages call it exactly as before: <Seo title=… description=… />.
export default function Seo({ title, description, image }) {
  const { pathname } = useLocation()
  const canonical = base ? `${base}${pathname}` : undefined
  const ogImage = abs(image || c.home_hero_image || c.logo)

  return (
    <Head>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={c.company_name} />
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
    </Head>
  )
}
