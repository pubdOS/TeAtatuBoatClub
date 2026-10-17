import { Head } from 'vite-react-ssg'
import c from '../../content.js'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import { EnquiryForm } from '../components/Lightbox.jsx'

// The Commodore's Snapper Classic (6 to 8 November 2026): everything from the
// club's rules PDF as a page people can share, reached from the home hero promo
// and the Events competition card. Built 2026-10-18 for Sara (the club's
// marketing contact); the PDF stays downloadable for the full wording.

const base = (c.url || '').replace(/\/$/, '')
const abs = (u) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${base}${u}`)

// Event structured data, so Google can show the dates, place and price. The
// start, end and price are plain content.js keys (not CMS fields) because the
// schema needs exact ISO times, which no one should have to type in an editor.
function eventSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: c.snapper_hero_title,
    description: c.snapper_seo_description,
    startDate: c.snapper_event_start,
    endDate: c.snapper_event_end,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [abs(c.snapper_hero_image)],
    url: `${base}/events/snapper-classic`,
    location: {
      '@type': 'Place',
      name: c.schema_name || c.company_name,
      address: c.address || undefined,
    },
    organizer: { '@type': 'Organization', name: c.schema_name || c.company_name, url: base },
    offers: {
      '@type': 'Offer',
      price: c.snapper_ticket_price,
      priceCurrency: 'NZD',
      availability: 'https://schema.org/InStock',
      url: `${base}/events/snapper-classic#tickets`,
    },
  }
}

export default function SnapperClassic() {
  return (
    <>
      <Seo title={c.snapper_seo_title} description={c.snapper_seo_description} image={c.snapper_hero_image} />
      <Head>
        <script type="application/ld+json">{JSON.stringify(eventSchema())}</script>
      </Head>
      <span hidden data-cms="Snapper Classic - SEO - Page Title">{c.snapper_seo_title}</span>
      <span hidden data-cms="Snapper Classic - SEO - Meta Description">{c.snapper_seo_description}</span>

      {/* ─── Hero ─── */}
      <section className="relative isolate flex min-h-[80vh] items-end overflow-hidden bg-navy-dark text-white md:items-center">
        <img
          src={c.snapper_hero_image}
          data-cms="Snapper Classic - Hero - Image"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[25%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent md:bg-gradient-to-l md:from-navy-dark/90 md:via-navy-dark/55 md:to-transparent" />
        {/* Fades the photo into the navy wave below on every width. */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-navy-dark to-transparent" />
        <div className="mx-auto flex w-full max-w-6xl justify-end px-5 pb-20 pt-40 md:py-24">
          <div className="w-full max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold" data-cms="Snapper Classic - Hero - Label">
              {c.snapper_hero_label}
            </p>
            <h1 className="mt-4">
              <span className="block aspect-[15/4] w-full max-w-md">
                <img src={c.snapper_hero_logo} data-cms="Snapper Classic - Hero - Logo" alt="" className="h-full w-full object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]" />
              </span>
              <span className="sr-only" data-cms="Snapper Classic - Hero - Title">{c.snapper_hero_title}</span>
            </h1>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] md:text-base" data-cms="Snapper Classic - Hero - Date">
              {c.snapper_hero_date}
            </p>
            <p className="mt-5 max-w-lg text-lg text-white/80 whitespace-pre-line" data-cms="Snapper Classic - Hero - Sub">
              {c.snapper_hero_sub}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#tickets" className="btn-primary" data-cms="Snapper Classic - Hero - Button">{c.snapper_hero_cta}</a>
              <a hidden href={c.snapper_rules_document} data-cms="Snapper Classic - Rules - Document">rules</a>
              <a href={c.snapper_rules_document} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <span data-cms="Snapper Classic - Rules - Download Label">{c.snapper_rules_label}</span>
              </a>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60" data-cms="Snapper Classic - Hero - Sponsor Label">
                {c.snapper_hero_sponsor_label}
              </span>
              <span className="rounded-xl bg-white px-3 py-2">
                <img src={c.snapper_hero_sponsor_logo} data-cms="Snapper Classic - Hero - Sponsor Logo" alt="Marine Deals" className="h-9 w-auto" />
              </span>
            </div>
          </div>
        </div>
      </section>
      <WaveDivider top="#071a33" bottom="#f2eada" />

      {/* ─── Key facts ─── */}
      <section className="bg-sand">
        <div data-cms-repeater="Snapper Classic - Facts" data-cms-shape="stat" data-cms-min="2" data-cms-recommend="4" data-cms-max="4" data-cms-overflow="wrap" className="repeat-balance [--rb-cols:2] md:[--rb-cols:4] [--rb-gap:2rem] mx-auto max-w-6xl gap-8 px-5 py-14">
          {c.snapper_facts.map((f, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-4xl font-semibold text-accent md:text-5xl" data-cms-field="value">{f.value}</p>
              <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy/55" data-cms-field="label">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── The weekend (timeline) ─── */}
      <section className="section grid gap-12 md:grid-cols-[1fr_1.6fr]">
        <AnimatedSection>
          <div className="md:sticky md:top-28">
            <span className="eyebrow" data-cms="Snapper Classic - Schedule - Label">{c.snapper_schedule_label}</span>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Snapper Classic - Schedule - Heading">{c.snapper_schedule_heading}</h2>
          </div>
        </AnimatedSection>
        <ol data-cms-repeater="Snapper Classic - Schedule" data-cms-shape="list" data-cms-min="1" data-cms-recommend="6" data-cms-max="10" data-cms-overflow="wrap" className="relative border-l-2 border-gold/60 pl-8">
          {c.snapper_schedule.map((s, i) => (
            <li key={i} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[2.45rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-gold bg-cream" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent" data-cms-field="when">{s.when}</p>
              <h3 className="mt-1.5 font-display text-xl font-semibold" data-cms-field="title">{s.title}</h3>
              <p className="mt-2 text-navy/70 whitespace-pre-line" data-cms-field="desc">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── How it works ─── */}
      <section className="bg-sea">
        <div className="section">
          <AnimatedSection className="mb-10 text-center">
            <span className="eyebrow" data-cms="Snapper Classic - Format - Label">{c.snapper_format_label}</span>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Snapper Classic - Format - Heading">{c.snapper_format_heading}</h2>
          </AnimatedSection>
          <div data-cms-repeater="Snapper Classic - Format" data-cms-shape="card" data-cms-min="2" data-cms-recommend="6" data-cms-max="9" data-cms-overflow="wrap" className="repeat-balance [--rb-cols:1] md:[--rb-cols:2] lg:[--rb-cols:3] gap-6">
            {c.snapper_format.map((f, i) => (
              <div key={i} className="card p-7">
                <span className="mb-4 block h-1 w-10 rounded bg-gold" />
                <h3 className="font-display text-xl font-semibold" data-cms-field="title">{f.title}</h3>
                <p className="mt-2 text-navy/70 whitespace-pre-line" data-cms-field="body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Fishing area ─── */}
      <section className="section grid items-start gap-12 md:grid-cols-2">
        <AnimatedSection>
          <span className="eyebrow" data-cms="Snapper Classic - Area - Label">{c.snapper_area_label}</span>
          <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Snapper Classic - Area - Heading">{c.snapper_area_heading}</h2>
          <p className="mt-4 text-lg text-navy/75" data-cms="Snapper Classic - Area - Body">{c.snapper_area_body}</p>
          <p className="mt-6 border-l-2 border-gold pl-5 leading-relaxed text-navy/75 whitespace-pre-line" data-cms="Snapper Classic - Area - Boundaries">{c.snapper_area_lines}</p>
          <p className="mt-6 text-sm text-navy/55" data-cms="Snapper Classic - Area - Note">{c.snapper_area_note}</p>
        </AnimatedSection>
        <AnimatedSection delay={120}>
          <figure>
            <a href={c.snapper_area_image} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl shadow-lg ring-1 ring-navy/10">
              <span className="block aspect-[4/5] w-full bg-navy/5">
                <img src={c.snapper_area_image} data-cms="Snapper Classic - Area - Map" alt="Tournament boundaries on a chart of the Hauraki Gulf" loading="lazy" className="h-full w-full object-contain" />
              </span>
            </a>
            <figcaption className="mt-3 text-center text-sm text-navy/55" data-cms="Snapper Classic - Area - Caption">{c.snapper_area_caption}</figcaption>
          </figure>
        </AnimatedSection>
      </section>

      {/* ─── Prizes ─── */}
      <section className="bg-navy-dark text-white">
        <div className="section">
          <AnimatedSection className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow text-gold" data-cms="Snapper Classic - Prizes - Label">{c.snapper_prizes_label}</span>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Snapper Classic - Prizes - Heading">{c.snapper_prizes_heading}</h2>
            <p className="mt-3 text-white/70" data-cms="Snapper Classic - Prizes - Sub">{c.snapper_prizes_sub}</p>
          </AnimatedSection>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.35fr]">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 md:p-8">
              <h3 className="font-display text-2xl font-semibold" data-cms="Snapper Classic - Prizes - Daily Heading">{c.snapper_prizes_daily_heading}</h3>
              <ul data-cms-repeater="Snapper Classic - Prizes - Daily" data-cms-shape="list" data-cms-min="1" data-cms-recommend="6" data-cms-max="12" data-cms-overflow="wrap" className="mt-5 divide-y divide-white/10">
                {c.snapper_prizes_daily.map((p, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="text-white/85" data-cms-field="category">{p.category}</span>
                    <span className="shrink-0 text-sm font-semibold text-gold" data-cms-field="placing">{p.placing}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-white/60 whitespace-pre-line" data-cms="Snapper Classic - Prizes - Daily Note">{c.snapper_prizes_daily_note}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 md:p-8">
              <h3 className="font-display text-2xl font-semibold" data-cms="Snapper Classic - Prizes - Overall Heading">{c.snapper_prizes_overall_heading}</h3>
              <ul data-cms-repeater="Snapper Classic - Prizes - Overall" data-cms-shape="list" data-cms-min="1" data-cms-recommend="17" data-cms-max="24" data-cms-overflow="wrap" className="mt-5 divide-y divide-white/10">
                {c.snapper_prizes_overall.map((p, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="text-white/85" data-cms-field="category">{p.category}</span>
                    <span className="shrink-0 text-sm font-semibold text-gold" data-cms-field="placing">{p.placing}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-white/60 whitespace-pre-line" data-cms="Snapper Classic - Prizes - Overall Note">{c.snapper_prizes_overall_note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tickets ─── */}
      <section id="tickets" className="scroll-mt-24 bg-sand">
        <div className="section grid items-center gap-12 md:grid-cols-2">
          <AnimatedSection>
            <span className="eyebrow" data-cms="Snapper Classic - Tickets - Label">{c.snapper_tickets_label}</span>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Snapper Classic - Tickets - Heading">{c.snapper_tickets_heading}</h2>
            <p className="mt-4 text-lg text-navy/75" data-cms="Snapper Classic - Tickets - Body">{c.snapper_tickets_body}</p>
            <p className="mt-4 text-navy/60" data-cms="Snapper Classic - Tickets - Contact">{c.snapper_tickets_contact}</p>
          </AnimatedSection>
          <div className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-navy/10 sm:p-8">
            <EnquiryForm
              about={c.snapper_hero_title}
              heading={c.snapper_tickets_form_heading}
              quantityLabel={c.snapper_tickets_quantity_label}
              success={c.snapper_tickets_success}
            />
          </div>
          <span hidden data-cms="Snapper Classic - Tickets - Form Heading">{c.snapper_tickets_form_heading}</span>
          <span hidden data-cms="Snapper Classic - Tickets - Quantity Label">{c.snapper_tickets_quantity_label}</span>
          <span hidden data-cms="Snapper Classic - Tickets - Success">{c.snapper_tickets_success}</span>
        </div>
      </section>

      {/* ─── Marine Deals bonus draw + sponsors ─── */}
      <section className="section text-center">
        <AnimatedSection>
          <div className="mx-auto max-w-3xl rounded-3xl border border-navy/10 bg-white px-6 py-8 shadow-sm sm:px-10">
            <h2 className="font-display text-2xl font-semibold" data-cms="Snapper Classic - Bonus - Heading">{c.snapper_bonus_heading}</h2>
            <p className="mt-3 text-navy/70 whitespace-pre-line" data-cms="Snapper Classic - Bonus - Body">{c.snapper_bonus_body}</p>
          </div>
        </AnimatedSection>
        <AnimatedSection className="mt-16">
          <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Snapper Classic - Sponsors - Heading">{c.snapper_sponsors_heading}</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy/70" data-cms="Snapper Classic - Sponsors - Sub">{c.snapper_sponsors_sub}</p>
          <img src={c.snapper_sponsors_main} data-cms="Snapper Classic - Sponsors - Main Sponsor" alt="Marine Deals" loading="lazy" className="mx-auto mt-10 h-24 w-auto md:h-32" />
          <span className="mx-auto mt-10 block aspect-[5/3] w-full max-w-4xl">
            <img src={c.snapper_sponsors_logos} data-cms="Snapper Classic - Sponsors - Logos" alt="Tournament sponsors" loading="lazy" className="h-full w-full object-contain" />
          </span>
        </AnimatedSection>
      </section>

      {/* ─── Good to know ─── */}
      <section className="border-t border-navy/10">
        <div className="section">
          <h2 className="text-center text-3xl font-semibold md:text-4xl" data-cms="Snapper Classic - Fine Print - Heading">{c.snapper_fine_heading}</h2>
          <div data-cms-repeater="Snapper Classic - Fine Print" data-cms-shape="list" data-cms-min="1" data-cms-recommend="4" data-cms-max="8" data-cms-overflow="wrap" className="repeat-balance [--rb-cols:1] md:[--rb-cols:2] mx-auto mt-10 max-w-4xl gap-6">
            {c.snapper_fine.map((f, i) => (
              <div key={i}>
                <h3 className="font-display text-lg font-semibold" data-cms-field="title">{f.title}</h3>
                <p className="mt-1.5 text-sm text-navy/70 whitespace-pre-line" data-cms-field="body">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href={c.snapper_rules_document} target="_blank" rel="noopener noreferrer" className="btn-outline">
              {/* Same label as the hero button, so it reads the field without re-declaring it. */}
              <span data-cms-static="reuses Snapper Classic - Rules - Download Label">{c.snapper_rules_label}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
