import { useEffect, useRef, useState } from 'react'

// A sideways strip (kit photos): starts in line with the page's content and
// runs to the right edge of the screen, whatever its width, with round arrows
// floating at each end only while there is more to see that way.
export default function ScrollStrip({ children }) {
  const track = useRef(null)
  const [more, setMore] = useState({ left: false, right: false })
  useEffect(() => {
    const el = track.current
    if (!el) return
    const sync = () => setMore({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', sync); ro.disconnect() }
  }, [children])
  const nudge = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' })
  const arrow = (dir) => (
    <button type="button" onClick={() => nudge(dir)} aria-label={dir < 0 ? 'Scroll back' : 'Scroll for more'}
      className={`kit-strip-arrow ${dir < 0 ? 'left-2' : 'right-4 md:right-8'} ${(dir < 0 ? more.left : more.right) ? '' : 'pointer-events-none opacity-0'}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={dir < 0 ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} /></svg>
    </button>
  )
  return (
    <div className="kit-strip relative">
      <div ref={track} className="kit-strip-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 pr-4 md:pr-8">{children}</div>
      {arrow(-1)}{arrow(1)}
    </div>
  )
}
