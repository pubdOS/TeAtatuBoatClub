// Post-build: generate sitemap.xml + robots.txt into dist/ from content.js.
// Runs after `vite-react-ssg build`. Keeps the sitemap in lock-step with
// nav_links (the route registry) and points robots at it. Allows all crawlers
// including AI crawlers (GPTBot, PerplexityBot, etc.) — we WANT to be readable.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import c from '../content.js'

const here = dirname(fileURLToPath(import.meta.url))
const dist = join(here, '..', 'dist')
if (!existsSync(dist)) mkdirSync(dist, { recursive: true })

const base = (c.url || '').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10) // build date (plain Node script)

// One <url> per nav route (dynamic/catch-all routes are not listed).
const paths = (c.nav_links || []).map((l) => l.to)
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  paths
    .map((p) => `  <url>\n    <loc>${base}${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n') +
  `\n</urlset>\n`

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`

writeFileSync(join(dist, 'sitemap.xml'), sitemap)
writeFileSync(join(dist, 'robots.txt'), robots)
console.log(`[gen-seo] wrote sitemap.xml (${paths.length} urls) + robots.txt → dist/`)
