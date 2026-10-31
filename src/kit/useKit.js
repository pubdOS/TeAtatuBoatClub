import { useEffect, useState } from 'react'

// A page's added sections (EDITING_ASSISTANT_PLAN.md, phase 2). Stored in one
// field, "<Page> - Page - Kit": a JSON list [{ id, type, variant, fields }].
// Inside the Pubd editor the bridge hands a changed list to the page as a
// `pubd:kit` event, and the page re-renders with its real components: that is
// the live preview. Outside the editor nothing listens.

export function parseKit(raw) {
  try {
    const v = typeof raw === 'string' && raw.trim() ? JSON.parse(raw) : raw
    return Array.isArray(v)
      ? v.filter((x) => x && typeof x.id === 'string' && typeof x.type === 'string').map((x) => ({ variant: null, fields: {}, ...x }))
      : []
  } catch {
    return []
  }
}

export default function useKit(page, raw) {
  const [list, setList] = useState(() => parseKit(raw))
  useEffect(() => {
    // The same test Layout uses to load the bridge: framed by the editor.
    if (window.self === window.top || !new URLSearchParams(window.location.search).has('pubd-edit')) return
    const key = `${page} - Page - Kit`
    const on = (e) => { if (e.detail?.key === key) setList(parseKit(e.detail.value)) }
    window.addEventListener('pubd:kit', on)
    return () => window.removeEventListener('pubd:kit', on)
  }, [page])
  return list
}
