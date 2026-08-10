import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Schema from './components/Schema.jsx'

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
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
