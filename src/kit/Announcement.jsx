import { useEffect, useRef, useState } from 'react'
import SmartLink from '../components/SmartLink.jsx'
import { builtAt, showingUntil } from './until.js'

// The announcement strip: one short line across the very top of the site
// ("Entries close Friday", "Closed over Christmas"), with an optional link.
// The site passes its own editable line as the child (a span with the class
// kit-announce-text holding c.nav_announcement), so the CMS reads it from the
// site's code; the link is a hidden field beside it. See the starter's Layout.
// An empty line = no strip (kit.css hides it), and the line stays on the page,
// so the editor can fill it in and the strip appears as it is typed. Still by default; only when the line is too
// long for the screen does it scroll, slowly, pausing under a pointer and never
// for someone who has asked for less motion. `until` (NZ time, see ./until.js)
// switches it off by itself: "Entries close Friday" never outlives Friday.
// Part of the shared kit: synced to every site from sitemog-starter. How it
// looks is the site's theme (kit-announce, kit-announce-text in THEME.md).
export default function Announcement({ link, until, children }) {
  const box = useRef(null)
  const [live, setLive] = useState(() => showingUntil(until, builtAt()))
  useEffect(() => { setLive(showingUntil(until, new Date())) }, [until])
  useEffect(() => {
    const b = box.current
    const l = b?.querySelector('.kit-announce-text')
    const room = l?.closest('.kit-announce-line')
    if (!b || !l || !room) return
    // Measure the words against the room they have (inside the strip's
    // padding): the editor changes the text in place, so this re-runs on every
    // size change of either.
    const fit = () => {
      const w = room.clientWidth
      b.classList.toggle('kit-announce-moving', l.scrollWidth > w)
      // One trip: in from the right edge, out past the left, at an easy
      // reading pace. It starts part-way, with the line already in view.
      const run = w + l.scrollWidth
      const time = Math.max(12, run / 45)
      b.style.setProperty('--kit-announce-from', `${w}px`)
      b.style.setProperty('--kit-announce-time', `${time}s`)
      b.style.setProperty('--kit-announce-delay', `${-(w / run) * time}s`)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(room)
    ro.observe(l)
    return () => ro.disconnect()
  }, [])
  return (
    // Hidden, not removed, once it has ended: the line stays on the page for
    // the editor to change.
    <div ref={box} className="kit-announce" hidden={!live}>
      {link ? <SmartLink to={link} className="kit-announce-line">{children}</SmartLink> : <span className="kit-announce-line">{children}</span>}
    </div>
  )
}
