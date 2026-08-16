// ── Pubd edit bridge (v5 — Phase 1) ──────────────────────────────────────────
// Loaded ONLY when this site runs inside the Pubd CMS visual editor (see the
// guard in main.jsx — an iframe + ?pubd-edit). Normal visitors never fetch this.
//
// Jobs: ① map data-cms elements, ② report the active section as the user scrolls
// (TERRITORY model — see below), ③ apply live text edits, ④ scroll/navigate on
// command (suppressing self-triggered scroll reports).

const ALLOWED_PARENTS = ['https://cms.pubd.io', 'http://localhost:3000']
let cmsOrigin = null

// "Home - Hero - Heading" → prefix "Home - Hero" (page-qualified section id)
function prefixOf(key) { return key.split(' - ').slice(0, 2).join(' - ') }

// key → [elements]. Rebuilt on load + after SPA navigation.
const fieldMap = new Map()
// Elements that vote for the active section: not inside a fixed/sticky container
// (the sticky navbar carries data-cms fields and would otherwise claim every
// scroll position).
let voters = []

function isPinned(el) {
  let n = el
  while (n && n !== document.body) {
    const pos = getComputedStyle(n).position
    if (pos === 'fixed' || pos === 'sticky') return true
    n = n.parentElement
  }
  return false
}

const repeaterMap = new Map() // repeater key → container element

function scan() {
  fieldMap.clear()
  repeaterMap.clear()
  voters = []
  document.querySelectorAll('[data-cms]').forEach((el) => {
    const key = el.getAttribute('data-cms')
    if (!key) return
    if (!fieldMap.has(key)) fieldMap.set(key, [])
    fieldMap.get(key).push(el)
  })
  document.querySelectorAll('[data-cms-repeater]').forEach((el) => {
    const key = el.getAttribute('data-cms-repeater')
    if (key) repeaterMap.set(key, el)
  })
  fieldMap.forEach((els, key) => {
    const prefix = prefixOf(key)
    for (const el of els) if (!isPinned(el)) voters.push({ el, prefix })
  })
  repeaterMap.forEach((el, key) => {
    if (!isPinned(el)) voters.push({ el, prefix: prefixOf(key) })
  })
}

// Template items of a repeater = direct children that carry/contain a field tag.
function itemsOf(container) {
  return Array.from(container.children).filter(
    (ch) => ch.matches('[data-cms-field]') || ch.querySelector('[data-cms-field]'),
  )
}

function post(msg) {
  window.parent.postMessage({ source: 'pubd-bridge', ...msg }, cmsOrigin || '*')
}

// ── Active section: the TERRITORY model (deterministic scrollspy) ─────────────
// Sections are ordered by where they currently start; each owns the page from
// its start until the next section's start. Untagged stretches (a video, a
// decorative block) belong to the section above them — no dead zones, no
// nearest-neighbour guessing. Active = the last section whose start sits above
// the anchor line (upper third of the viewport).
function activeSectionNow() {
  const anchor = window.innerHeight * 0.35
  const tops = new Map() // prefix → current min top
  for (const { el, prefix } of voters) {
    if (!el.getClientRects().length) continue
    const t = el.getBoundingClientRect().top
    const cur = tops.get(prefix)
    if (cur === undefined || t < cur) tops.set(prefix, t)
  }
  let best = null
  let bestTop = -Infinity
  tops.forEach((t, prefix) => {
    if (t <= anchor && t > bestTop) { bestTop = t; best = prefix }
  })
  if (best) return best
  // Above the first section (page top) → the first section
  let first = null
  let firstTop = Infinity
  tops.forEach((t, prefix) => { if (t < firstTop) { firstTop = t; first = prefix } })
  return first
}

let lastPrefix = null
function report() {
  const prefix = activeSectionNow()
  if (prefix && prefix !== lastPrefix) {
    lastPrefix = prefix
    post({ type: 'section', prefix })
  }
}

// ── Scroll handling + programmatic-scroll suppression ─────────────────────────
// While a `goto` smooth-scroll is in flight, the page sweeps past intermediate
// sections — reporting those would fight the user's chosen target. So during a
// commanded scroll we stay quiet until the scroll settles, then declare the
// target as the active section outright.
let debounceT = null
let suppress = false
let suppressTarget = null
let settleT = null
let safetyT = null

function finishSuppress() {
  if (!suppress) return
  suppress = false
  clearTimeout(settleT)
  clearTimeout(safetyT)
  if (suppressTarget) {
    lastPrefix = suppressTarget
    post({ type: 'section', prefix: suppressTarget })
    suppressTarget = null
  }
}

function onScroll() {
  if (suppress) {
    clearTimeout(settleT)
    settleT = setTimeout(finishSuppress, 170) // no scroll events for 170ms = settled
    return
  }
  clearTimeout(debounceT)
  debounceT = setTimeout(report, 100)
}

// ── Commands from the CMS ─────────────────────────────────────────────────────
// Apply a value to an element. Images: swap the src AND any CSS-background twin
// that painted the same source (the hidden-companion convention). Scope the
// twin search to the whole doc for flat fields, or the item for repeater fields.
function applyValue(el, value, scope) {
  if (el.tagName === 'IMG') {
    const old = el.getAttribute('src')
    el.src = value || ''
    // Clearing an image sets the twin to 'none', never url('') — a removed
    // photo must actually disappear, not linger as a broken background.
    const paint = (n) => { n.style.backgroundImage = value ? `url(${value})` : 'none' }
    if (old) {
      ;(scope || document).querySelectorAll('[style]').forEach((n) => {
        if (n.style.backgroundImage && n.style.backgroundImage.includes(old)) paint(n)
      })
    } else if (el.parentElement && value) {
      // Previously-empty slot: no old src to match. The hidden-companion
      // convention keeps the CSS-background layer beside the img, so update
      // background layers in the same parent that carry no decoration of
      // their own ('none' or a real url) — never gradient washes.
      el.parentElement.querySelectorAll('[style]').forEach((n) => {
        const bg = n.style.backgroundImage
        if (bg === 'none' || (bg && bg.includes('url('))) paint(n)
      })
    }
  } else {
    el.textContent = value
  }
}

function setField(key, value) {
  const els = fieldMap.get(key)
  if (!els) return
  for (const el of els) applyValue(el, value, document)
}

// Reconcile a whole repeater to a draft array (hydration): top up / trim the
// item count with the same primitives the live ops use, then set every field
// of every item. Nested objects (composites) aren't previewable yet — skipped.
function setRepeater(key, json) {
  const container = repeaterMap.get(key)
  if (!container) return
  let items
  try { items = JSON.parse(json) } catch { return }
  if (!Array.isArray(items)) return
  let count = itemsOf(container).length
  while (count > items.length) { itemRemove(key, count - 1); count-- }
  while (count < items.length) { itemAdd(key, items[count]); count++ }
  items.forEach((item, i) => {
    Object.entries(item || {}).forEach(([field, value]) => {
      if (value !== null && typeof value === 'object') return
      setItemField(key, i, field, String(value ?? ''))
    })
  })
}

// Route a hydrated value to the right applier — repeater JSON vs flat field.
function apply(key, value) {
  if (repeaterMap.has(key) && typeof value === 'string' && value.trim().startsWith('[')) setRepeater(key, value)
  else setField(key, value)
}

function setItemField(repeaterKey, index, field, value) {
  const container = repeaterMap.get(repeaterKey)
  if (!container) return
  const item = itemsOf(container)[index]
  if (!item) return
  const targets = item.matches(`[data-cms-field="${field}"]`)
    ? [item]
    : Array.from(item.querySelectorAll(`[data-cms-field="${field}"]`))
  for (const el of targets) applyValue(el, value, item)
}

// Add = clone the last template item (a clone IS what React would render),
// fill its fields, append. Remove/move = plain DOM surgery. Preview-only —
// the truth is the draft the panel saves.
function itemAdd(repeaterKey, values) {
  const container = repeaterMap.get(repeaterKey)
  if (!container) return
  const items = itemsOf(container)
  const template = items[items.length - 1]
  if (!template) return
  const clone = template.cloneNode(true)
  container.appendChild(clone)
  Object.entries(values || {}).forEach(([field, value]) => {
    const targets = clone.matches(`[data-cms-field="${field}"]`)
      ? [clone]
      : Array.from(clone.querySelectorAll(`[data-cms-field="${field}"]`))
    for (const el of targets) applyValue(el, String(value ?? ''), clone)
  })
}

function itemRemove(repeaterKey, index) {
  const container = repeaterMap.get(repeaterKey)
  if (!container) return
  itemsOf(container)[index]?.remove()
}

function itemMove(repeaterKey, from, to) {
  const container = repeaterMap.get(repeaterKey)
  if (!container) return
  const items = itemsOf(container)
  const node = items[from]
  if (!node || !items[to]) return
  container.insertBefore(node, from < to ? items[to].nextSibling : items[to])
}

function beginSuppress(target) {
  suppress = true
  suppressTarget = target
  clearTimeout(safetyT)
  safetyT = setTimeout(finishSuppress, 1800) // never stay muted forever
  clearTimeout(settleT)
  settleT = setTimeout(finishSuppress, 300) // already-in-view = no scroll events
}

function goTo(prefix) {
  const page = prefix.split(' - ')[0]
  // Page chrome doesn't live in the normal scroll flow: the Nav is sticky (so
  // scrollIntoView on it is a no-op and clicking "Nav" appeared to do nothing),
  // and the Footer is the page's tail. Handle them by scrolling the page itself.
  if (page === 'Nav') {
    beginSuppress(prefix)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  if (page === 'Footer') {
    beginSuppress(prefix)
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    return
  }
  for (const [key, els] of fieldMap) {
    if (!key.startsWith(prefix + ' - ')) continue
    const el = els.find((e) => e.getClientRects().length) || els[0]
    if (el) {
      beginSuppress(prefix)
      el.style.scrollMarginTop = '96px' // clear the sticky navbar
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }
  // A section that is ONLY a repeater (e.g. "Services - List") has no flat
  // data-cms field carrying the prefix — scroll to the repeater container itself.
  const rep = repeaterMap.get(prefix)
  if (rep) {
    beginSuppress(prefix)
    rep.style.scrollMarginTop = '96px'
    rep.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function navigate(path) {
  window.history.pushState({}, '', path) // patched below — triggers the rescan
  window.dispatchEvent(new PopStateEvent('popstate')) // react-router follows
}

// ── SPA route changes ─────────────────────────────────────────────────────────
// The site is a SPA: any nav click swaps the DOM under us, and only CMS-driven
// navigation used to rescan — in-site links left the field map stale and the
// panel stuck on the old page. Watch history itself (pushState/replaceState +
// back/forward), wait for React to render, rescan, re-apply every draft value
// the CMS has sent (fresh pages mount with published content), and report.
const applied = {}
let routeT = null
let routeT2 = null
function routeWork() {
  scan()
  lastPrefix = null
  Object.entries(applied).forEach(([k, v]) => apply(k, v))
  post({ type: 'page', path: window.location.pathname })
  report()
  measureAspects()
}

// Report each image slot's real rendered aspect so the panel previews the crop
// the site actually uses (an arch, a square) instead of assuming 16:9. Hidden
// companion imgs have no box — measure their parent (the visible frame).
function measureAspects() {
  const map = {}
  const boxFor = (el) => {
    const n = el.getClientRects().length ? el : el.parentElement
    if (!n) return null
    const r = n.getBoundingClientRect()
    return r.width > 20 && r.height > 20 ? r : null
  }
  fieldMap.forEach((els, key) => {
    const img = els.find((e) => e.tagName === 'IMG')
    if (!img) return
    const r = boxFor(img)
    if (r) map[key] = Math.round((r.width / r.height) * 100) / 100
  })
  repeaterMap.forEach((container, key) => {
    const first = itemsOf(container)[0]
    if (!first) return
    first.querySelectorAll('[data-cms-field]').forEach((el) => {
      if (el.tagName !== 'IMG') return
      const r = boxFor(el)
      if (r) map[key + '::' + el.getAttribute('data-cms-field')] = Math.round((r.width / r.height) * 100) / 100
    })
  })
  if (Object.keys(map).length) post({ type: 'aspects', map })
}
function onRouteChange() {
  clearTimeout(routeT)
  clearTimeout(routeT2)
  routeT = setTimeout(() => {
    routeWork()
    routeT2 = setTimeout(routeWork, 800) // settle pass — slow pages, late images
  }, 400)
}
const origPush = history.pushState.bind(history)
history.pushState = (...args) => { origPush(...args); onRouteChange() }
const origReplace = history.replaceState.bind(history)
history.replaceState = (...args) => { origReplace(...args); onRouteChange() }
window.addEventListener('popstate', onRouteChange)

window.addEventListener('message', (event) => {
  if (!ALLOWED_PARENTS.includes(event.origin)) return
  const msg = event.data
  if (!msg || msg.source !== 'pubd-cms') return
  cmsOrigin = event.origin
  if (msg.type === 'hydrate') Object.entries(msg.diff || {}).forEach(([k, v]) => { applied[k] = v; apply(k, v) })
  if (msg.type === 'set') { applied[msg.key] = msg.value; setField(msg.key, msg.value) }
  if (msg.type === 'cache') applied[msg.key] = msg.value // replay state only — no DOM work
  if (msg.type === 'set-item') setItemField(msg.key, msg.index, msg.field, msg.value)
  if (msg.type === 'item-add') itemAdd(msg.key, msg.values)
  if (msg.type === 'item-remove') itemRemove(msg.key, msg.index)
  if (msg.type === 'item-move') itemMove(msg.key, msg.from, msg.to)
  if (msg.type === 'goto') goTo(msg.prefix)
  if (msg.type === 'navigate') navigate(msg.path)
})

// The page is really unloading (external link, hard reload) — tell the panel
// so it doesn't keep floating over a page we no longer control.
window.addEventListener('pagehide', () => post({ type: 'bye' }))

// ── Boot ──────────────────────────────────────────────────────────────────────
scan()
window.addEventListener('scroll', onScroll, { passive: true })
window.addEventListener('resize', onScroll, { passive: true })
post({ type: 'hello', version: 5, path: window.location.pathname })
setTimeout(report, 300)
setTimeout(measureAspects, 600) // after first paint settles
