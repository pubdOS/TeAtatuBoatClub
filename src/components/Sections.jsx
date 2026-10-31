import { Children, cloneElement, isValidElement } from 'react'
import useKit from '../kit/useKit.js'
import KitSection from '../kit/KitSection.jsx'

// Sections a client can hide, show and reorder in the editor (EDITOR_CONTRACT.md,
// "Section order"; EDITING_ASSISTANT_PLAN.md phase 1). Also the slot the section
// kit fills in phase 2.
//
//   a hidden span carrying the "Home - Page - Layout" field (c.home_page_layout), then
//   <Sections layout={c.home_page_layout} tones={['alt', 'base']}>
//     <Section id="Home - Stats">…</Section>
//     <Section id="Home - CTA" pin="brand" className="bg-brand text-white">…</Section>
//   </Sections>
//
// The layout is JSON {"order":[ids],"hidden":[ids]} stored like any field. Empty
// = the order written here, nothing hidden, so a site looks exactly as built until
// someone moves something.
//
// Hidden sections are still rendered, with `hidden`, so the editor can show one
// again instantly. Backgrounds come from POSITION (`data-tone`, alternating
// `tones`), not from each section, so moving or hiding one never leaves two
// same-coloured neighbours. A section whose look must not change wherever it
// goes says so with `pin` (styled by its own classes, skipped by the alternation).

export function parseLayout(raw) {
  try {
    const v = typeof raw === 'string' && raw.trim() ? JSON.parse(raw) : raw
    return {
      order: Array.isArray(v?.order) ? v.order.filter((x) => typeof x === 'string') : [],
      hidden: Array.isArray(v?.hidden) ? v.hidden.filter((x) => typeof x === 'string') : [],
    }
  } catch {
    return { order: [], hidden: [] }
  }
}

/** The ids in display order: those named in `order` first, in that order; any
 *  other keeps its written position after them. */
export function orderIds(ids, order) {
  const named = order.filter((id) => ids.includes(id))
  return [...named, ...ids.filter((id) => !named.includes(id))]
}

/** Tone per id, alternating over the visible unpinned sections. */
export function tonesFor(ids, hidden, pins, tones) {
  const out = {}
  let i = 0
  for (const id of ids) {
    if (pins[id]) { out[id] = pins[id]; continue }
    if (hidden.includes(id)) { out[id] = tones[0]; continue }
    out[id] = tones[i % tones.length]
    i++
  }
  return out
}

// `page` + `kit`: the page's added sections ("<Page> - Page - Kit"), rendered
// after the written ones as movable sections of their own (phase 2).
export default function Sections({ layout, tones = ['base', 'alt'], page, kit, children }) {
  const added = useKit(page || '', kit)
  const kids = [
    ...Children.toArray(children).filter(isValidElement),
    ...(page ? added.map((k) => (
      <Section key={k.id} id={`${page} - Kit ${k.id}`} kit={k.type}>
        <KitSection type={k.type} variant={k.variant} fields={k.fields} />
      </Section>
    )) : []),
  ]
  const byId = new Map(kids.map((k) => [k.props.id, k]))
  const { order, hidden } = parseLayout(layout)
  const ids = orderIds(kids.map((k) => k.props.id), order)
  const pins = Object.fromEntries(kids.filter((k) => k.props.pin).map((k) => [k.props.id, k.props.pin]))
  const tone = tonesFor(ids, hidden, pins, tones)
  // `tones` rides on each section so the editor's bridge can re-deal them
  // after a live move, the same way this does.
  return ids.map((id) => cloneElement(byId.get(id), { key: id, tone: tone[id], tones: tones.join(','), isHidden: hidden.includes(id) }))
}

export function Section({ id, pin, tone, tones, isHidden, kit, as: Tag = 'section', className = '', children }) {
  return (
    <Tag
      data-cms-section={id}
      data-cms-movable=""
      data-cms-tone-pin={pin || undefined}
      data-tone={tone}
      data-cms-tones={tones}
      data-cms-kit={kit || undefined}
      hidden={isHidden || undefined}
      className={className}
    >
      {children}
    </Tag>
  )
}
