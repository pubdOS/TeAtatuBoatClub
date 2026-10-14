import { useEffect, useRef, useState } from 'react'

// Scroll-reveal hook — no dependencies. Fires once when the element scrolls in.
//
// Inside the Pubd editor nothing waits to be scrolled to: a field that has not
// faded in yet cannot be found or selected. The edit bridge marks <html> with
// `pubd-editor` a moment after the page mounts (it loads on demand), so this
// watches for the class rather than reading it once.
export function useInView(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) show()
      },
      { threshold: 0.15, ...options },
    )
    const editor = new MutationObserver(() => {
      if (root.classList.contains('pubd-editor')) show()
    })
    function show() {
      setVisible(true)
      obs.disconnect()
      editor.disconnect()
    }
    if (root.classList.contains('pubd-editor')) {
      show()
      return
    }
    obs.observe(el)
    editor.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => {
      obs.disconnect()
      editor.disconnect()
    }
  }, [])
  return [ref, visible]
}
