import { Link } from 'react-router-dom'
import c from '../../content.js'
import SmartLink from '../components/SmartLink.jsx'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'

// ── Simple nautical line icons (stroke = currentColor) ──
function WheelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
      <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  )
}
function AnchorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
      <circle cx="12" cy="4.5" r="1.8" /><path d="M12 6.3V21M6 12H4a8 8 0 0 0 16 0h-2M8.5 9.5h7" />
    </svg>
  )
}
export default function Facilities() {
  return (
    <>
      <Seo title={c.facilities_seo_title} description={c.facilities_seo_description} />
      <span hidden data-cms="Facilities - SEO - Page Title">{c.facilities_seo_title}</span>
      <span hidden data-cms="Facilities - SEO - Meta Description">{c.facilities_seo_description}</span>
      {/* Hero */}
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Facilities - Hero - Heading">
            {c.facilities_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Facilities - Hero - Sub">{c.facilities_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      {/* Work bays — the headline facility for members */}
      <section className="section">
        <AnimatedSection className="mx-auto mb-12 max-w-2xl text-center">
          <span className="eyebrow" data-cms="Facilities - Bays - Label">{c.facilities_bays_label}</span>
          <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Facilities - Bays - Heading">
            {c.facilities_bays_heading}
          </h2>
          <p className="mt-4 text-navy/70 whitespace-pre-line" data-cms="Facilities - Bays - Body">{c.facilities_bays_body}</p>
        </AnimatedSection>

        <div data-cms-repeater="Facilities - Bays - List" data-cms-shape="card" data-cms-min="2" data-cms-recommend="4" data-cms-max="8" data-cms-overflow="wrap" data-cms-note="Bays are named in booking order — keep them listed in the same order as the physical bays." className="repeat-balance [--rb-cols:1] sm:[--rb-cols:2] lg:[--rb-cols:4] cms-count-root gap-6">
          {c.work_bays.map((bay, i) => (
            <div key={i} className="card group relative overflow-hidden p-6">
              <span className="absolute right-0 top-0 h-16 w-16 -translate-y-8 translate-x-8 rounded-full bg-gold/15 transition-transform group-hover:scale-150" />
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                <WheelIcon />
              </div>
              <p className="relative text-xs font-semibold uppercase tracking-widest text-accent" data-cms-static="index numbering inside a repeater — the bay name beside it is the editable field">Bay <span className="cms-count" /></p>
              <h3 className="relative mt-1 font-display text-xl font-semibold" data-cms-field="name">{bay.name}</h3>
              <p className="relative mt-1.5 text-sm text-navy/60 whitespace-pre-line" data-cms-field="desc">{bay.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-navy px-6 py-6 text-center text-white sm:justify-between sm:text-left">
          <p className="text-lg">
            <span data-cms="Facilities - Bays - Book Note">{c.facilities_book_note}</span>{' '}
            <span className="font-semibold text-gold" data-cms="Facilities - Bays - Book Rate">{c.facilities_book_note_rate}</span>
          </p>
          <SmartLink to={c.facilities_book_button_link} className="btn-primary shrink-0" data-cms="Facilities - Bays - Book Button">{c.facilities_book_button}</SmartLink>
          <span hidden data-cms="Facilities - Bays - Book Button Link">{c.facilities_book_button_link}</span>
        </div>
      </section>

      {/* Other facilities */}
      <section className="bg-sand">
        <div className="section">
          <AnimatedSection className="mb-12 text-center">
            <span className="eyebrow justify-center" data-cms="Facilities - Other - Label">{c.facilities_other_label}</span>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Facilities - Other - Heading">
              {c.facilities_other_heading}
            </h2>
          </AnimatedSection>
          <div data-cms-repeater="Facilities - Other" data-cms-shape="card" data-cms-min="2" data-cms-recommend="6" data-cms-max="9" data-cms-overflow="wrap" className="repeat-balance [--rb-cols:1] sm:[--rb-cols:2] lg:[--rb-cols:3] gap-6">
            {c.facilities_other.map((f, i) => (
              <div key={i} className="card flex gap-4 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <AnchorIcon />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold" data-cms-field="title">{f.title}</h3>
                  <p className="mt-1 text-sm text-navy/65 whitespace-pre-line" data-cms-field="desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery teaser */}
      <WaveDivider top="#f2eada" bottom="#0b2545" />
      <section className="bg-navy">
        <div className="section text-center text-white">
          <AnimatedSection>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Facilities - Gallery - Heading">
              {c.facilities_gallery_heading}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/75" data-cms="Facilities - Gallery - Sub">
              {c.facilities_gallery_sub}
            </p>
            <SmartLink to={c.facilities_gallery_button_link} className="btn-primary mt-6" data-cms="Facilities - Gallery - Button">{c.facilities_gallery_button}</SmartLink>
            <span hidden data-cms="Facilities - Gallery - Button Link">{c.facilities_gallery_button_link}</span>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
