import { useEffect, useRef } from 'react'

// Full-screen image viewer. Controlled by the parent:
//   const [i, setI] = useState(null)        // null = closed
//   <Lightbox items={srcArray} index={i} setIndex={setI} />
// Click a thumbnail → setI(thatIndex). Esc / click backdrop / ✕ closes;
// ← → (and on-screen arrows) navigate when there's more than one image.
//
// `label` is optional and describes what is being shown. Pass it whenever the
// viewer opens on its own rather than because someone clicked a thumbnail: a
// dialog that appears unbidden containing one unlabelled image tells a screen
// reader user nothing at all. When it is given, focus moves to Close on open and
// returns to wherever it was on close, so a keyboard user is not left tabbing
// around behind an overlay they did not ask for.
export default function Lightbox({ items, index, setIndex, label }) {
  const open = index != null && Array.isArray(items) && items.length > 0
  const count = open ? items.length : 0

  const closeRef = useRef(null)
  const restoreRef = useRef(null)

  // Only for a viewer that opened by itself. A lightbox the user clicked already
  // has their focus in a sensible place, and stealing it would be the intrusive
  // behaviour rather than the helpful one.
  useEffect(() => {
    if (!open || !label) return
    restoreRef.current = document.activeElement
    closeRef.current?.focus()
    return () => {
      const el = restoreRef.current
      if (el && typeof el.focus === 'function') el.focus()
    }
  }, [open, label])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null)
      else if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count)
      else if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, count, setIndex])

  if (!open) return null
  const item = items[index]
  const src = typeof item === 'string' ? item : item?.src || item?.image
  const multiple = count > 1
  const step = (delta) => (e) => {
    e.stopPropagation()
    setIndex((i) => (i + delta + count) % count)
  }

  return (
    <div
      onClick={() => setIndex(null)}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-navy-dark/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={label || undefined}
    >
      <button
        ref={closeRef}
        onClick={() => setIndex(null)}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
      </button>

      {multiple && (
        <button
          onClick={step(-1)}
          aria-label="Previous image"
          className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
      )}

      <img
        src={src}
        alt={label || ''}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
      />

      {/* A tall document on a narrow screen is limited by WIDTH, not height, so a
          portrait menu lands at about a third of its real size and its body text
          renders around 9px — measured, not guessed. Fine to look at, impossible
          to read, and a phone is where most people will open it.

          Rather than fight the overlay's geometry, hand them the file: the
          browser's own viewer pinches and pans properly. Only on small screens,
          and only for a labelled (announcement) viewer — a gallery someone
          clicked into on a desktop has no such problem. */}
      {label && (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-5 left-1/2 flex h-11 -translate-x-1/2 items-center rounded-full bg-white/10 px-5 text-sm text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 sm:hidden"
        >
          Open full size
        </a>
      )}

      {multiple && (
        <button
          onClick={step(1)}
          aria-label="Next image"
          className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      )}

      {multiple && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
          {index + 1} / {count}
        </span>
      )}
    </div>
  )
}
