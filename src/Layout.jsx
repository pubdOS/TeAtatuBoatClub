import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Schema from './components/Schema.jsx'
import Announcement from './kit/Announcement.jsx'
import c from '../content.js'

// The shared shell wrapping every route (was App's body). Owns the site-wide
// JSON-LD (Schema) so it ships on every prerendered page.
export default function Layout() {
  // Pubd visual-editor bridge — client-only. Lives in a useEffect (not module
  // scope) so it never runs during SSG, where `window` is undefined.
  useEffect(() => {
    if (window.self !== window.top && new URLSearchParams(window.location.search).has('pubd-edit')) {
      import('./pubd-edit-bridge.js')
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Schema />
      {/* The announcement strip (shared kit): empty = hidden. */}
      <Announcement link={c.nav_announcement_link} until={c.nav_announcement_until}>
        <span className="kit-announce-text" data-cms="Nav - Announcement - Text">{c.nav_announcement}</span>
      </Announcement>
      <span hidden data-cms="Nav - Announcement - Link">{c.nav_announcement_link}</span>
      <span hidden data-cms="Nav - Announcement - Until" data-cms-label="Hide after (NZ time, e.g. 2026-11-01 17:00)">{c.nav_announcement_until}</span>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
