import SmartLink from '../components/SmartLink.jsx'
import ScrollStrip from './ScrollStrip.jsx'
import Photo from './Photo.jsx'
import { framed } from './framing.js'
import { theme } from './theme.js'
import './kit.css'

// The kit's section types (EDITING_ASSISTANT_PLAN.md, "The kit catalogue").
//
// SHARED: this file is the same on every site, synced from sitemog-starter by
// sitemog-toolkit/scripts/sync-kit.sh. Never edit it in a client site. A site
// makes the kit its own through its THEME: the kit-* roles below, styled in its
// src/index.css with its own colours, fonts and spacing, plus the few switches
// in src/kit/theme.js. So an added section looks like the rest of the site, and
// a fix to the kit reaches every site at once. Roles: src/kit/THEME.md.
//
// Layout only here (grids, gaps, widths, alignment); never a colour or a font.

const s = (v) => (typeof v === 'string' ? v : '')
// Under a left-aligned heading (theme.headingAlign), a narrow block lines up
// with it instead of sitting centred below it.
const narrow = () => (theme.headingAlign === 'left' ? '' : 'mx-auto')
const list = (v) => (Array.isArray(v) ? v : [])

function Heading({ eyebrow, heading, intro, align = theme.headingAlign || 'center', mark = false }) {
  if (!eyebrow && !heading && !intro) return null
  const { Mark } = theme
  return (
    <div className={`kit-head mb-10 max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {mark && Mark && <span className="kit-accent block"><Mark className="h-8 w-8" /></span>}
      {eyebrow && <p className="kit-eyebrow">{eyebrow}</p>}
      {heading && <h2 className="kit-h2">{heading}</h2>}
      {intro && <p className="kit-intro">{intro}</p>}
    </div>
  )
}

const Button = ({ to, children, secondary }) => (
  <SmartLink to={to} className={`${secondary ? 'kit-btn-secondary' : 'kit-btn-primary'} kit-btn`}><span className="kit-btn-label">{children}</span></SmartLink>
)

// 1. Logo or graphic strip: a still row, or a slow scrolling strip when there
// are many or more keep coming.
function LogoStrip({ variant, f }) {
  const items = list(f.items).filter((x) => x?.image)
  const logo = (x, i) => (
    <img key={i} src={x.image} alt={s(x.name)} loading="lazy"
      className={`${f.square ? 'kit-tile h-28 w-28 object-cover md:h-36 md:w-36' : 'kit-logo h-12 w-auto max-w-[9rem] object-contain md:h-14'} shrink-0`} />
  )
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
      {variant === 'scroll' ? (
        <div className="kit-marquee">
          <div className="kit-marquee-track flex w-max items-center gap-10">
            {items.map(logo)}{items.map((x, i) => logo(x, `b${i}`))}
          </div>
        </div>
      ) : (
        <div className={`flex flex-wrap items-center gap-x-12 gap-y-8 ${theme.headingAlign === 'left' ? '' : 'justify-center'}`}>{items.map(logo)}</div>
      )}
    </div>
  )
}

// 2. Testimonials: a grid of quotes, or one featured quote.
function Testimonials({ variant, f }) {
  const items = list(f.items).filter((x) => x?.quote)
  const person = (x) => (
    <figcaption className="mt-5 flex items-center gap-3">
      {x.photo && <img src={x.photo} alt="" className="h-11 w-11 rounded-full object-cover" {...framed(x.photo)} />}
      <span className="text-left"><span className="kit-name block">{s(x.name)}</span>{x.business && <span className="kit-meta">{x.business}</span>}</span>
    </figcaption>
  )
  if (variant === 'featured' && items[0]) {
    const x = items[0]
    return (
      <div className="kit-section">
        <figure className="mx-auto max-w-3xl text-center">
          <blockquote className="kit-quote-lg">“{x.quote}”</blockquote>
          <div className="flex justify-center">{person(x)}</div>
        </figure>
      </div>
    )
  }
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} />
      <div className="kit-balance [--rb-cols:1] md:[--rb-cols:2] lg:[--rb-cols:3]">
        {items.map((x, i) => (
          <figure key={i} className="kit-card flex flex-col justify-between">
            <blockquote className="kit-quote">“{x.quote}”</blockquote>
            {person(x)}
          </figure>
        ))}
      </div>
    </div>
  )
}

// 3. Text and photo: photo left or right, or the words alone (policies, terms).
function TextPhoto({ variant, f }) {
  const text = (
    <div className="kit-head min-w-0">
      {f.eyebrow && <p className="kit-eyebrow">{f.eyebrow}</p>}
      {f.heading && <h2 className="kit-h2">{f.heading}</h2>}
      {f.body && <div className="kit-text whitespace-pre-line">{f.body}</div>}
      {f.button && f.link && <div className="kit-actions"><Button to={f.link} secondary>{f.button}</Button></div>}
    </div>
  )
  if (variant === 'text' || !f.image) return <div className="kit-section"><div className={`${narrow()} max-w-3xl`}>{text}</div></div>
  return (
    <div className="kit-section">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <Photo src={f.image} alt={s(f.imageAlt)} loading="lazy" className={`kit-photo aspect-[4/3] w-full ${variant === 'photo-right' ? 'md:order-2' : ''}`} />
        {text}
      </div>
    </div>
  )
}

// 4. Call to action band: one button or two.
function CtaBand({ variant, f }) {
  return (
    <div className="kit-section kit-head text-center">
      {f.heading && <h2 className="kit-h2">{f.heading}</h2>}
      {f.body && <p className="kit-cta-text mx-auto max-w-xl">{f.body}</p>}
      <div className="kit-actions flex flex-wrap justify-center gap-3">
        {f.button && <Button to={s(f.link) || '/contact'}>{f.button}</Button>}
        {variant === 'two-buttons' && f.button2 && <Button to={s(f.link2) || '/'} secondary>{f.button2}</Button>}
      </div>
    </div>
  )
}

// 5. Cards: services, features, reasons. A small mark per card, a photo per
// card, or the words alone; an optional button under them.
function Cards({ variant, f }) {
  const items = list(f.items).filter((x) => x?.title || x?.body)
  const left = (theme.cardsHeading || theme.headingAlign) === 'left'
  const { Mark } = theme
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} align={left ? 'left' : 'center'} mark={left} />
      <div className="kit-balance [--rb-cols:1] sm:[--rb-cols:2] lg:[--rb-cols:3]">
        {items.map((x, i) => {
          const photo = variant === 'photo' && x.image
          return (
            // A wrapper per card, as the site's own sections do, so every card
            // in a row stretches to the tallest.
            <div key={i}><div className={`kit-card h-full ${photo ? 'kit-card-photo overflow-hidden' : ''}`}>
              {photo && <Photo src={x.image} alt="" loading="lazy" className="aspect-[4/3] w-full" />}
              <div className={photo ? 'kit-card-body' : ''}>
                {variant === 'icon' && (
                  <span className="kit-mark mb-4 flex items-center justify-center rounded-full">
                    {Mark ? <Mark className="h-6 w-6" /> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>}
                  </span>
                )}
                {x.title && <h3 className="kit-h3 kit-card-title">{x.title}</h3>}
                {x.body && <p className="kit-small mt-2">{x.body}</p>}
              </div>
            </div></div>
          )
        })}
      </div>
      {f.button && f.link && <div className={`mt-10 ${left ? '' : 'text-center'}`}><Button to={f.link} secondary>{f.button}</Button></div>}
    </div>
  )
}

const initials = (n) => s(n).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

// 6. Numbers: two to four figures with a label each.
function Numbers({ f }) {
  const items = list(f.items).filter((x) => x?.value)
  const divided = theme.numbers === 'divided'
  return (
    <div className="kit-section kit-numbers">
      {f.heading && <h2 className="kit-numbers-heading text-center">{f.heading}</h2>}
      <div className={divided ? 'kit-divided' : 'kit-fit'}>
        {items.map((x, i) => (
          <div key={i} className={divided ? 'kit-cell' : ''}>
            <p className={`kit-figure ${divided ? '' : 'kit-fit-value'}`}>{x.value}</p>
            {x.label && <p className="kit-figure-label">{x.label}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// 7. People: a card per person (photo or initials), or one person featured.
function People({ variant, f }) {
  const items = list(f.items).filter((x) => x?.name)
  const face = (x, big) => (
    <span className={`kit-face relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${big ? 'h-40 w-40 text-4xl' : 'h-16 w-16 text-xl'}`}>
      {initials(x.name)}
      {x.photo && <img src={x.photo} alt={s(x.name)} loading="lazy" className="absolute inset-0 h-full w-full object-cover" {...framed(x.photo)} />}
    </span>
  )
  if (variant === 'featured' && items[0]) {
    const x = items[0]
    return (
      <div className="kit-section">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center md:flex-row md:text-left">
          {face(x, true)}
          <div className="kit-head min-w-0">
            {f.heading && <p className="kit-eyebrow">{f.heading}</p>}
            <h2 className="kit-h2 kit-person">{x.name}</h2>
            {x.role && <p className="kit-role">{x.role}</p>}
            {x.bio && <p className="kit-text whitespace-pre-line">{x.bio}</p>}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
      <div className="kit-balance [--rb-cols:1] sm:[--rb-cols:2] lg:[--rb-cols:3]">
        {items.map((x, i) => (
          <div key={i}><div className="kit-card flex h-full flex-col items-start">
            {face(x, false)}
            <h3 className="kit-h3 mt-4">{x.name}</h3>
            {x.role && <p className="kit-role">{x.role}</p>}
            {x.bio && <p className="kit-small mt-2">{x.bio}</p>}
          </div></div>
        ))}
      </div>
    </div>
  )
}

// 8. Photos: a grid whose short last row sits centred (3, then 2 centred), or
// a strip that runs to the screen's edge with arrows. Landscape or square
// (f.shape): a square strip tile is narrower, so the strip keeps its height.
function Photos({ variant, f }) {
  const items = list(f.items).filter((x) => x?.image)
  const square = f.shape === 'square'
  const photo = (x, i, cls) => (
    <figure key={i} className={cls}>
      <Photo src={x.image} alt={s(x.caption)} loading="lazy" className={`kit-tile ${square ? 'aspect-square' : 'aspect-[4/3]'} w-full`} />
      {x.caption && <figcaption className="kit-meta mt-2">{x.caption}</figcaption>}
    </figure>
  )
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
      {variant === 'strip'
        ? <ScrollStrip>{items.map((x, i) => photo(x, i, `${square ? 'w-56 md:w-72' : 'w-72 md:w-96'} shrink-0 snap-start`))}</ScrollStrip>
        : <div className="kit-balance [--rb-cols:2] md:[--rb-cols:3]">{items.map((x, i) => photo(x, i, ''))}</div>}
    </div>
  )
}

// 9. Steps: across the page or down it; a date or time on any step is optional.
function Steps({ variant, f }) {
  const items = list(f.items).filter((x) => x?.title)
  if (variant === 'timeline') {
    return (
      <div className="kit-section">
        <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
        {/* w-fit: the line and its steps sit centred as one block, not a
            narrow list stuck to the left of a centred column. */}
        <ol className={`kit-timeline ${narrow()} w-fit max-w-2xl pl-6 text-left`}>
          {items.map((x, i) => (
            <li key={i} className="relative pb-8 last:pb-0">
              <span className="kit-dot absolute -left-[31px] top-1.5 h-3 w-3 rounded-full" />
              {x.when && <p className="kit-accent">{x.when}</p>}
              <h3 className="kit-h3">{x.title}</h3>
              {x.body && <p className="kit-step-text mt-1">{x.body}</p>}
            </li>
          ))}
        </ol>
      </div>
    )
  }
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
      <ol className="kit-balance [--rb-cols:1] sm:[--rb-cols:2] lg:[--rb-cols:4]">
        {items.map((x, i) => (
          <li key={i}>
            <span className="kit-step flex items-center justify-center rounded-full">{i + 1}</span>
            {x.when && <p className="kit-accent mt-4">{x.when}</p>}
            <h3 className={`kit-h3 ${x.when ? 'mt-1' : 'mt-4'}`}>{x.title}</h3>
            {x.body && <p className="kit-small mt-1">{x.body}</p>}
          </li>
        ))}
      </ol>
    </div>
  )
}

// 10. FAQ: questions that open one at a time.
function Faq({ f }) {
  const items = list(f.items).filter((x) => x?.question)
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
      <div className={`kit-faq ${narrow()} max-w-3xl`}>
        {items.map((x, i) => (
          <details key={i} className="group py-4">
            <summary className="kit-question flex cursor-pointer list-none items-center justify-between gap-4">
              {x.question}
              <span className="kit-accent transition-transform group-open:rotate-45">+</span>
            </summary>
            {x.answer && <p className="kit-text mt-3 whitespace-pre-line">{x.answer}</p>}
          </details>
        ))}
      </div>
    </div>
  )
}

// 11. Downloads: files to open or save (rules, forms, price sheets), one row
// each with an optional note ("Updated October 2026").
function Downloads({ f }) {
  const items = list(f.items).filter((x) => x?.file)
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
      <ul className={`kit-files ${narrow()} max-w-3xl`}>
        {items.map((x, i) => (
          <li key={i}>
            <a href={x.file} target="_blank" rel="noopener noreferrer" className="kit-file flex items-center gap-4 py-4">
              <svg className="kit-accent h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M12 12v6M9.5 15.5 12 18l2.5-2.5" /></svg>
              <span className="min-w-0 flex-1">
                <span className="kit-h3 block">{s(x.title) || 'Download'}</span>
                {x.note && <span className="kit-meta block">{x.note}</span>}
              </span>
              <svg className="kit-accent h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 12. Pricing: a price list (many items, each with a unit: per tonne, per
// hour), or two to four packages side by side, one of them highlighted.
function Pricing({ variant, f }) {
  if (variant === 'packages') {
    const items = list(f.items).filter((x) => x?.name)
    return (
      <div className="kit-section">
        <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
        <div className="kit-balance [--rb-cols:1] md:[--rb-cols:2] lg:[--rb-cols:3]">
          {items.map((x, i) => (
            <div key={i}><div className={`kit-card kit-package flex h-full flex-col ${x.highlight === 'yes' ? 'kit-package-highlight' : ''}`}>
              <h3 className="kit-h3">{x.name}</h3>
              {x.price && <p className="mt-3"><span className="kit-price">{x.price}</span>{x.unit && <span className="kit-price-unit"> {x.unit}</span>}</p>}
              {x.note && <p className="kit-small mt-2">{x.note}</p>}
              {s(x.features).trim() && (
                <ul className="mt-5 space-y-2">
                  {s(x.features).split('\n').map((line) => line.trim()).filter(Boolean).map((line, j) => (
                    <li key={j} className="kit-small flex gap-2">
                      <svg className="kit-accent mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div></div>
          ))}
        </div>
        {f.button && f.link && <div className="mt-10 text-center"><Button to={f.link}>{f.button}</Button></div>}
      </div>
    )
  }
  const items = list(f.items).filter((x) => x?.name)
  return (
    <div className="kit-section">
      <Heading eyebrow={s(f.eyebrow)} heading={s(f.heading)} intro={s(f.intro)} />
      <ul className={`kit-prices ${narrow()} max-w-3xl`}>
        {items.map((x, i) => (
          <li key={i} className="flex items-baseline justify-between gap-6 py-4">
            <span className="min-w-0">
              <span className="kit-h3 block">{x.name}</span>
              {x.note && <span className="kit-meta block">{x.note}</span>}
            </span>
            <span className="shrink-0 text-right">
              <span className="kit-price-row">{s(x.price)}</span>
              {x.unit && <span className="kit-price-unit"> {x.unit}</span>}
            </span>
          </li>
        ))}
      </ul>
      {f.button && f.link && <div className={`mt-10 ${theme.headingAlign === 'left' ? '' : 'text-center'}`}><Button to={f.link} secondary>{f.button}</Button></div>}
    </div>
  )
}

const TYPES = { 'logo-strip': LogoStrip, testimonials: Testimonials, 'text-photo': TextPhoto, 'cta-band': CtaBand, cards: Cards, numbers: Numbers, people: People, photos: Photos, steps: Steps, faq: Faq, downloads: Downloads, pricing: Pricing }
export const KIT_TYPES = Object.keys(TYPES)

export default function KitSection({ type, variant, fields }) {
  const T = TYPES[type]
  // kit-type-<type>: lets a theme tune one type (.kit-type-cards .kit-section).
  return T ? <div className={`kit-type-${type} contents`}><T variant={variant} f={fields || {}} /></div> : null
}
