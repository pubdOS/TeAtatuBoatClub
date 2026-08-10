import { Head } from 'vite-react-ssg'
import { useLocation } from 'react-router-dom'
import c from '../../content.js'

// CMS-data-driven JSON-LD. Because Pubd owns both the <head> and the content, this
// structured data is always valid and always in sync with the site. Two blocks:
//   • LocalBusiness (site-wide) — the NAP single source of truth as machine-readable
//     data: name, address, phone, email, url, logo, area served, social profiles.
//   • BreadcrumbList (inner pages) — the page's position in the site.
// We deliberately DON'T emit structured opening-hours or reviews here: the current
// hours field is free text (not the schema time format) and reviews must be
// substantiated, so marking them up would be invalid/unsafe (see the roadmap
// guardrails). Add those when they're modelled as real structured fields.

const baseUrl = (c.url || '').replace(/\/$/, '')
const abs = (u) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`)

function localBusiness() {
  const node = {
    '@context': 'https://schema.org',
    '@type': c.schema_type || 'LocalBusiness',
    name: c.schema_name || c.company_name,   // schema_name = real business name when company_name is a display hack
    url: baseUrl || undefined,
    telephone: c.phone || undefined,
    email: c.email || undefined,
    address: c.address || undefined,
    image: abs(c.home_hero_image || c.logo),
    logo: abs(c.logo),
    areaServed: c.areas || undefined,
    sameAs: (c.socials || []).map((s) => s.url).filter(Boolean),
  }
  if (!node.sameAs.length) delete node.sameAs
  // Drop undefined keys so the output stays clean.
  return JSON.parse(JSON.stringify(node))
}

function breadcrumb(pathname) {
  const link = (c.nav_links || []).find((l) => l.to === pathname)
  if (!link || pathname === '/') return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl || '/' },
      { '@type': 'ListItem', position: 2, name: link.label, item: `${baseUrl}${pathname}` },
    ],
  }
}

export default function Schema() {
  const { pathname } = useLocation()
  const crumbs = breadcrumb(pathname)
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(localBusiness())}</script>
      {crumbs ? <script type="application/ld+json">{JSON.stringify(crumbs)}</script> : null}
    </Head>
  )
}
