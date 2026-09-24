// ── Pubd edit bridge (v5 — Phase 1) ──────────────────────────────────────────
// Loaded ONLY when this site runs inside the Pubd CMS visual editor (see the
// guard in main.jsx — an iframe + ?pubd-edit). Normal visitors never fetch this.
//
// Jobs: ① map data-cms elements, ② report the active section as the user scrolls
// (TERRITORY model — see below), ③ apply live text edits, ④ scroll/navigate on
// command (suppressing self-triggered scroll reports).

const ALLOWED_PARENTS = ['https://cms.pubd.io', 'http://localhost:3000']

// WHAT THIS COPY OF THE BRIDGE CAN DO.
//
// The bridge ships inside every client repo, so at any moment the fleet is
// running several different versions of this file — and they drift, because a
// site only picks up a change when someone deploys it. On 2026-09-03 there were
// THREE genuinely different bridge files across 13 repos and every one of them
// posted `version: 5`, so the CMS had no way to know what the site in front of
// it could actually do.
//
// A version NUMBER cannot fix that on its own: it only works if it is bumped
// every time the file changes, and history says it will not be. So the bridge
// declares its capabilities by NAME instead. The CMS asks "can this site do X",
// never "is this version >= N", which is self-describing and survives drift.
//
// An older bridge sends no `can` at all. The CMS reads that as "nothing beyond
// the original set", which is exactly right, and degrades instead of sending
// messages into a void. Add a name here in the same commit that adds the
// feature — never before it works.
const CAN = [
  'set-collection', // rewrite a whole list in place: galleries and sub-lists
  'tap-select', // phone editor: edit mode, tap reports a field, select highlights it
]
let cmsOrigin = null

// "Home - Hero - Heading" → prefix "Home - Hero" (page-qualified section id)
// MUST match VisualEditor.prefixOf. The panel groups Nav and Footer as ONE
// section each (they are single strips a visitor reads as one thing), so if this
// keeps reporting two-segment prefixes the panel is handed a section name it does
// not know — scrolling into the footer reported "Footer - Contact", the panel
// could not match it, and fell back to the first section, so reaching the bottom
// of a page bounced the editor back to the hero.
const ONE_PIECE_PAGES = new Set(['Nav', 'Footer'])
function prefixOf(key) {
  const parts = key.split(' - ')
  return ONE_PIECE_PAGES.has(parts[0]) ? parts[0] : parts.slice(0, 2).join(' - ')
}

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
  // The anchor is the line a section's top must cross to become "current".
  // A FIXED anchor (35% of the viewport) strands the end of every page: once the
  // document bottoms out there is no scroll left to push the final sections up
  // past that line, so they could never become current and the client had to
  // reach for the dropdown. So the anchor SLIDES — as the remaining scroll runs
  // out it walks down toward the foot of the viewport, giving each of the last
  // sections its turn on the way. (A previous attempt put this after the anchor
  // selection, where it was dead code: a section scrolled past always matched
  // first and returned.)
  const ih = window.innerHeight
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - ih)
  // The anchor walks down the viewport across the WHOLE page, 25% to 85%, in step
  // with scroll progress. A section is current while its start sits above the
  // anchor and below the next section's start, so the anchor's travel is what
  // gives each section its turn — and a FIXED anchor gives that turn a width set
  // by the section's height alone. That is why short sections became slivers a
  // client could only reach with the arrows (Stead's Resources - Library owned
  // 90px of a 540px page) and why the last section before a tall footer often
  // got no turn at all.
  //
  // Chosen by measuring, not taste. Across four real pages, worst-case section
  // window: fixed 0.35 (what shipped) 0/130/20/50px · fixed 0.5 30/260/150/190 ·
  // largest-visible-territory 0/240/10/0 · this 110/210/250/250. Note the
  // coverage model — the obvious "pick whatever fills the screen" answer — is
  // WORSE than what it replaced: a tall neighbour swallows a short section whole.
  const progress = maxScroll <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / maxScroll))
  const anchor = ih * (0.25 + 0.6 * progress)

  const tops = new Map() // prefix → current min top
  for (const { el, prefix } of voters) {
    if (!el.getClientRects().length) continue
    const top = el.getBoundingClientRect().top
    const cur = tops.get(prefix)
    if (cur === undefined || top < cur) tops.set(prefix, top)
  }
  // At the very top of a page the answer is always the FIRST section. The rule
  // below picks the LOWEST section still above the anchor, which is right while
  // scrolling but wrong at rest on page load: if a hero is short, the hero AND
  // the section under it can both sit above the anchor line, and the section
  // under it wins. That is the "hero shows for a split second, then jumps to
  // intro on its own" flicker — the first report lands before layout settles,
  // then a second one after images and fonts resolve hands it to the intro.
  if (window.scrollY <= 4) {
    let first = null
    let firstTop = Infinity
    tops.forEach((top, prefix) => { if (top < firstTop) { firstTop = top; first = prefix } })
    if (first) return first
  }

  let best = null
  let bestTop = -Infinity
  tops.forEach((top, prefix) => {
    if (top <= anchor && top > bestTop) { bestTop = top; best = prefix }
  })
  if (best) return best
  // Above the first section (page top) → the first section
  let first = null
  let firstTop = Infinity
  tops.forEach((top, prefix) => { if (top < firstTop) { firstTop = top; first = prefix } })
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
      // The visible painter is not always a CSS background. Where the mapping
      // lives on a hidden companion and a COMPONENT renders the real <img>
      // (Runpoint's DeviceFrame), that img carries no data-cms-field, so it kept
      // the cloned item's picture while the companion updated — a newly added
      // item showed the previous one's screenshot. Twin plain <img>s too.
      ;(scope || document).querySelectorAll('img').forEach((n) => {
        if (n !== el && n.getAttribute('src') === old) n.src = value || ''
      })
    } else if (value) {
      // Previously-empty slot: no old src to match on. This is the case for a
      // NEWLY ADDED repeater item, whose companion starts blank — so the branch
      // above never runs and the first picture the client uploads appeared
      // nowhere on the page (Runpoint Product, 2026-08-21).
      if (el.parentElement) {
        // The hidden-companion convention keeps the CSS-background layer beside
        // the img, so update background layers in the same parent that carry no
        // decoration of their own ('none' or a real url) — never gradient washes.
        el.parentElement.querySelectorAll('[style]').forEach((n) => {
          const bg = n.style.backgroundImage
          if (bg === 'none' || (bg && bg.includes('url('))) paint(n)
        })
      }
      // …and the painter may equally be a plain <img> rendered by a component
      // (a device frame, a card thumbnail). Search the whole item scope, since
      // it usually sits in a sibling subtree rather than the same parent.
      ;(scope || el.parentElement || document).querySelectorAll('img').forEach((n) => {
        if (n !== el && !n.getAttribute('src')) n.src = value
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

// Index-derived output (an "05" numeral, an alternating left/right class) comes
// from the .map() index, NOT from a data-cms-field — so a clone carries the
// SOURCE item's number and side, and only the field values get overwritten. That
// made every added item repeat the previous one's number and image side. Fixed
// two ways below: clone the item TWO back so index PARITY is already right, and
// renumber any text node that is exactly the source item's index.
function renumberClone(clone, from, to) {
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT)
  const hits = []
  while (walker.nextNode()) {
    // "05" · "5." · " 5 " — a whole text node that is just the index.
    const m = /^(\s*)(\d+)(\D*)$/.exec(walker.currentNode.nodeValue || '')
    if (m && parseInt(m[2], 10) === from) hits.push([walker.currentNode, m])
  }
  for (const [node, m] of hits) {
    node.nodeValue = m[1] + String(to).padStart(m[2].length, '0') + m[3]
  }
}

// Add = clone a template item, fill its fields, append. Remove/move = plain DOM
// surgery. Preview-only — the truth is the draft the panel saves.
function itemAdd(repeaterKey, values) {
  const container = repeaterMap.get(repeaterKey)
  if (!container) return
  const items = itemsOf(container)
  // Two back, not one: alternating layouts repeat with period 2, so the item at
  // n-2 already carries the classes position n needs.
  const srcIndex = items.length >= 2 ? items.length - 2 : items.length - 1
  const template = items[srcIndex]
  if (!template) return
  const clone = template.cloneNode(true)
  renumberClone(clone, srcIndex + 1, items.length + 1)
  container.appendChild(clone)
  Object.entries(values || {}).forEach(([field, value]) => {
    const targets = clone.matches(`[data-cms-field="${field}"]`)
      ? [clone]
      : Array.from(clone.querySelectorAll(`[data-cms-field="${field}"]`))
    for (const el of targets) applyValue(el, String(value ?? ''), clone)
  })
}

// ── Sub-lists: a repeatable list belonging to ONE repeater item ──────────────
//
// A service's own schedule of bullets, say. Edits to these used to save fine and
// then sit there invisibly: the panel speaks in FIELDS (`set-item`), and there
// was no message that could rewrite a whole list of rows, so the client typed a
// bullet and watched the page not move until the next publish.
//
// Deliberately NOT used for galleries. A gallery's DOM is a FILTERED projection
// of its array — the boat club's drops any photo outside the current album — so
// rebuilding the list from the array would resurrect photos the visitor has
// filtered out. That needs its own answer, not this one.
//
// The first row is kept as a template the moment we first see the list, so a
// list emptied to zero can still be rebuilt afterwards. Without that, deleting
// the last bullet would remove the only thing left to clone and every later add
// would silently do nothing until a reload.
const sublistTemplates = new WeakMap()

function setCollection(msg) {
  if (msg.kind !== 'sublist') return
  const parent = repeaterMap.get(msg.key)
  if (!parent) return
  const item = itemsOf(parent)[msg.index]
  if (!item) return
  const sel = `[data-cms-sublist="${msg.name}"]`
  const container = item.matches(sel) ? item : item.querySelector(sel)
  if (!container) return

  if (!sublistTemplates.has(container) && container.firstElementChild) {
    sublistTemplates.set(container, container.firstElementChild.cloneNode(true))
  }
  const template = sublistTemplates.get(container)
  if (!template) return

  const rows = Array.isArray(msg.items) ? msg.items : []
  while (container.children.length > rows.length) container.lastElementChild.remove()
  while (container.children.length < rows.length) container.appendChild(template.cloneNode(true))

  Array.from(container.children).forEach((row, i) => {
    Object.entries(rows[i] || {}).forEach(([field, value]) => {
      const fsel = `[data-cms-subfield="${field}"]`
      const targets = row.matches(fsel) ? [row] : Array.from(row.querySelectorAll(fsel))
      for (const el of targets) applyValue(el, String(value ?? ''), row)
    })
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
  const onScreen = (e) => e && e.getClientRects().length > 0

  const scrollTo = (el) => {
    beginSuppress(prefix)
    el.style.scrollMarginTop = '96px' // clear the sticky navbar
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Find something you can actually SEE.
  //
  // This used to take the first key matching the prefix and scroll to it, which
  // silently did nothing whenever that first key was a hidden companion span —
  // and hidden companions are a convention, not an edge case (Rule 16 button
  // links, Rule 11 PDFs, and any eyebrow a design dropped but kept editable).
  // `scrollIntoView` on a display:none element is a no-op, and the early return
  // meant the visible heading two keys later was never considered.
  let hidden = null
  for (const [key, els] of fieldMap) {
    if (!key.startsWith(prefix + ' - ')) continue
    const visible = els.find(onScreen)
    if (visible) { scrollTo(visible); return }
    if (!hidden) hidden = els[0]
  }

  // A section that is ONLY a repeater has no flat data-cms field to aim at, so
  // scroll to the repeater container. Matched by PREFIX, not by exact key: a
  // section is "Page - Section" while its repeater is "Page - Section - Name",
  // so an exact lookup never hit and this fallback could not fire at all.
  // A visible repeater also beats a hidden field — the point is to show
  // something, not merely to find a match.
  for (const [key, el] of repeaterMap) {
    if (key !== prefix && !key.startsWith(prefix + ' - ')) continue
    if (onScreen(el)) { scrollTo(el); return }
  }

  // Nothing on this section is on screen (a whole hidden block). Aim at the
  // hidden element anyway: it is a no-op visually, but it keeps the panel's
  // active section in step with the arrows rather than stalling.
  if (hidden) scrollTo(hidden)
}

// ── Tap to edit (the phone editor) ────────────────────────────────────────────
// A phone has no room for a panel listing fields, so the site itself is the
// interface: in edit mode every editable element gets a quiet outline, a tap on
// one is REPORTED instead of followed, and the CMS opens that one field in a
// sheet. Off by default and only switched on by `edit-mode`, which the desktop
// editor never sends, so nothing here runs there.
let editMode = false
let selectedEls = []
const EDITABLE = '[data-cms], [data-cms-field]'
// A gallery is edited as a whole (photos, albums, order) in the CMS's photo
// manager, so a tap anywhere on it reports the gallery rather than one image.
const TAPPABLE = EDITABLE + ', [data-cms-gallery]'

function editStyle(on) {
  let el = document.getElementById('pubd-edit-style')
  if (!on) { if (el) el.remove(); return }
  if (el) return
  el = document.createElement('style')
  el.id = 'pubd-edit-style'
  el.textContent =
    'html.pubd-editing [data-cms], html.pubd-editing [data-cms-field], html.pubd-editing .pubd-photo, html.pubd-editing [data-cms-gallery]' +
    '{outline:1.5px dashed rgba(15,118,110,.6);outline-offset:3px;border-radius:4px;cursor:pointer}' +
    'html.pubd-editing .pubd-selected' +
    '{outline:2px solid #14b8a6 !important;outline-offset:4px;box-shadow:0 0 0 8px rgba(20,184,166,.16)}'
  document.head.appendChild(el)
}

// A photo is usually painted by an untagged layer (a CSS background, a component's
// <img>) and edited through a hidden `<img data-cms…>` companion beside it. The
// companion has no box to outline or tap, so its visible parent stands in for it.
const isPhotoCompanion = (el) => el.tagName === 'IMG' && !el.getClientRects().length
function markPhotos(on) {
  document.querySelectorAll('.pubd-photo').forEach((n) => n.classList.remove('pubd-photo'))
  if (!on) return
  document.querySelectorAll(EDITABLE).forEach((el) => {
    if (isPhotoCompanion(el) && el.parentElement) el.parentElement.classList.add('pubd-photo')
  })
}
function boxOf(el) {
  if (el.getClientRects().length) return el.getBoundingClientRect()
  return isPhotoCompanion(el) && el.parentElement ? el.parentElement.getBoundingClientRect() : null
}

// What the CMS calls a field: a flat key, or one field of one repeater item.
function describe(el) {
  if (el.hasAttribute('data-cms-gallery')) return { kind: 'gallery', key: el.getAttribute('data-cms-gallery') }
  if (el.hasAttribute('data-cms')) return { kind: 'field', key: el.getAttribute('data-cms') }
  const field = el.getAttribute('data-cms-field')
  const container = el.closest('[data-cms-repeater]')
  if (!field || !container) return null
  const index = itemsOf(container).findIndex((it) => it === el || it.contains(el))
  return index < 0 ? null : { kind: 'item', key: container.getAttribute('data-cms-repeater'), index, field }
}
const sameField = (a, b) => !!a && !!b && a.kind === b.kind && a.key === b.key && a.index === b.index && a.field === b.field

function elementsFor(d) {
  if (!d) return []
  if (d.kind === 'gallery') return Array.from(document.querySelectorAll(`[data-cms-gallery="${d.key}"]`))
  if (d.kind === 'field') return fieldMap.get(d.key) || []
  const container = repeaterMap.get(d.key)
  const item = container && itemsOf(container)[d.index]
  if (!item) return []
  const sel = `[data-cms-field="${d.field}"]`
  return item.matches(sel) ? [item] : Array.from(item.querySelectorAll(sel))
}

// The tapped element, or the hidden photo companion of what was tapped. Anything
// else (a hamburger, a tab, a plain link) is not ours and behaves normally.
function editableFrom(node) {
  const direct = node && node.closest ? node.closest(TAPPABLE) : null
  if (direct && boxOf(direct)) return direct
  let n = node
  for (let i = 0; n && n.children && i < 4; i++, n = n.parentElement) {
    const img = Array.from(n.children).find((c) => c.tagName === 'IMG' && c.matches(EDITABLE))
    if (img) return img
  }
  return null
}

// Every editable field on screen, in page order: the phone sheet's ‹ › walk.
function fieldList() {
  const out = []
  document.querySelectorAll(TAPPABLE).forEach((el) => {
    if (!boxOf(el)) return // hidden: a collapsed menu, a "… Link" companion
    const d = describe(el)
    if (d && !out.some((o) => sameField(o, d))) out.push(d)
  })
  return out
}
function postFields() { if (editMode) post({ type: 'fields', list: fieldList() }) }

// Fields within a thumb's width of the tap, nearest first. The sheet offers
// them as chips when a tap lands between an eyebrow, a heading and a button.
function nearbyAt(x, y, target) {
  const hits = []
  document.querySelectorAll(EDITABLE).forEach((el) => {
    const r = boxOf(el)
    if (!r || !r.width) return
    const dx = Math.max(r.left - x, 0, x - r.right)
    const dy = Math.max(r.top - y, 0, y - r.bottom)
    if (dx > 22 || dy > 22) return
    const d = describe(el)
    if (d && !sameField(d, target) && !hits.some((h) => sameField(h.d, d))) hits.push({ d, dist: dx + dy })
  })
  return hits.sort((a, b) => a.dist - b.dist).slice(0, 4).map((h) => h.d)
}

// Capture phase on the document: runs before the site's own handlers, so a tap
// on an editable link or button opens the field instead of navigating.
function onTap(e) {
  if (!editMode) return
  const el = editableFrom(e.target)
  const target = el && describe(el)
  if (!target) return
  e.preventDefault()
  e.stopPropagation()
  post({ type: 'tap', target, nearby: nearbyAt(e.clientX, e.clientY, target) })
}
document.addEventListener('click', onTap, true)

function setEditMode(on) {
  editMode = on
  document.documentElement.classList.toggle('pubd-editing', on)
  editStyle(on)
  markPhotos(on)
  if (on) postFields()
  else select(null)
}

// Highlight the field being edited and bring it into the top of the screen,
// above the sheet that now covers the bottom half.
function select(target, topRatio) {
  selectedEls.forEach((n) => n.classList.remove('pubd-selected'))
  selectedEls = []
  if (!target) return
  const els = elementsFor(target).map((el) => (isPhotoCompanion(el) ? el.parentElement : el)).filter(Boolean)
  els.forEach((n) => n.classList.add('pubd-selected'))
  selectedEls = els
  const first = els.find((n) => n.getClientRects().length)
  if (!first) return
  const r = first.getBoundingClientRect()
  beginSuppress(prefixOf(target.key))
  window.scrollTo({ top: Math.max(0, r.top + window.scrollY - window.innerHeight * (topRatio ?? 0.16)), behavior: 'smooth' })
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
  if (editMode) { markPhotos(true); postFields() }
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
  if (msg.type === 'set-collection') setCollection(msg)
  if (msg.type === 'item-remove') itemRemove(msg.key, msg.index)
  if (msg.type === 'item-move') itemMove(msg.key, msg.from, msg.to)
  if (msg.type === 'goto') goTo(msg.prefix)
  if (msg.type === 'navigate') navigate(msg.path)
  if (msg.type === 'edit-mode') setEditMode(!!msg.on)
  if (msg.type === 'select') select(msg.target || null, msg.topRatio)
  // Adding or removing an item changes what ‹ › walks through.
  if (msg.type === 'item-add' || msg.type === 'item-remove' || msg.type === 'item-move' || msg.type === 'hydrate') postFields()
})

// The page is really unloading (external link, hard reload) — tell the panel
// so it doesn't keep floating over a page we no longer control.
window.addEventListener('pagehide', () => post({ type: 'bye' }))

// ── Boot ──────────────────────────────────────────────────────────────────────
scan()
window.addEventListener('scroll', onScroll, { passive: true })
window.addEventListener('resize', onScroll, { passive: true })
post({ type: 'hello', version: 6, can: CAN, path: window.location.pathname })
setTimeout(report, 300)
setTimeout(measureAspects, 600) // after first paint settles
