import { useState } from 'react'
import c from '../../content.js'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'

export default function Events() {
  // Which competition's details modal is open (index into c.competitions), or null.
  const [openComp, setOpenComp] = useState(null)
  const comp = openComp != null ? c.competitions[openComp] : null

  return (
    <>
      <Seo title={c.events_seo_title} description={c.events_seo_description} />
      <span hidden data-cms="Events - SEO - Page Title">{c.events_seo_title}</span>
      <span hidden data-cms="Events - SEO - Meta Description">{c.events_seo_description}</span>
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Events - Hero - Heading">
            {c.events_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Events - Hero - Sub">{c.events_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      <section className="section mx-auto max-w-3xl text-center">
        <AnimatedSection>
          <p className="text-lg text-navy/70" data-cms="Events - Whats On - Intro">{c.events_intro_body}</p>
        </AnimatedSection>
      </section>

      {/* Club newsletter — admin uploads the PDF in the CMS (Events ▸ Newsletter Document).
          The field is declared once on the hidden anchor below; the visible block just
          reads the value, so there's no duplicate data-cms key. */}
      <section className="section pt-0">
        <AnimatedSection>
          <div className="mx-auto max-w-xl rounded-3xl border border-navy/10 bg-sand px-6 py-8 text-center">
            <h2 className="font-display text-2xl font-semibold text-navy" data-cms="Events - Whats On - Newsletter Heading">
              {c.events_newsletter_heading}
            </h2>
            <p className="mt-2 text-navy/70" data-cms="Events - Whats On - Newsletter Body">{c.events_newsletter_body}</p>
            {/* CMS-mapped file field (PDF upload happens here) — hidden on the live site. */}
            <a hidden href={c.events_newsletter_document} data-cms="Events - Whats On - Newsletter Document">newsletter</a>
            {c.events_newsletter_document ? (
              <a
                href={c.events_newsletter_document}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6 inline-flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" />
                </svg>
                <span data-cms="Events - Whats On - Newsletter Download Label">{c.events_newsletter_download_label}</span>
              </a>
            ) : (
              <p className="mt-6 text-sm italic text-navy/45" data-cms="Events - Whats On - Newsletter Empty">{c.events_newsletter_empty}</p>
            )}
          </div>
        </AnimatedSection>
      </section>

      {/* Events (repeater) */}
      <section className="section pt-0">
        <div data-cms-repeater="Events - Whats On - List" data-cms-shape="list" data-cms-min="1" data-cms-recommend="3" data-cms-max="9" data-cms-overflow="wrap" className="repeat-balance [--rb-cols:1] md:[--rb-cols:3] gap-6">
          {c.events.map((e, i) => (
            <div key={i} className="card flex flex-col p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-accent" data-cms-field="date">{e.date}</span>
              <h3 className="mt-2 font-display text-xl font-semibold" data-cms-field="title">{e.title}</h3>
              <p className="mt-2 text-sm text-navy/70 whitespace-pre-line" data-cms-field="desc">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Competitions (repeater) — clickable cards open a details modal with rules. */}
      <section className="bg-sand">
        <div className="section">
          <AnimatedSection>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold text-navy" data-cms="Events - Competitions - Heading">
                {c.competitions_heading}
              </h2>
              <p className="mt-3 text-navy/70" data-cms="Events - Competitions - Sub">{c.competitions_sub}</p>
            </div>
          </AnimatedSection>

          {c.competitions.length > 0 ? (
            <div data-cms-repeater="Events - Competitions - List" data-cms-shape="list" data-cms-min="1" data-cms-recommend="3" data-cms-max="9" data-cms-overflow="wrap" className="repeat-balance [--rb-cols:1] sm:[--rb-cols:2] lg:[--rb-cols:3] gap-6">
              {c.competitions.map((comp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setOpenComp(i)}
                  className="card group flex flex-col overflow-hidden p-0 text-left transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-navy/5">
                    <img
                      src={comp.image}
                      alt=""
                      loading="lazy"
                      data-cms-field="image"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold text-navy" data-cms-field="title">{comp.title}</h3>
                    <span className="mt-auto pt-3 text-sm font-semibold text-accent" data-cms-static="per-card affordance inside a repeater — a data-cms here would duplicate its key on every card">View rules &amp; details →</span>
                    {/* Hidden fields so the CMS maps them — shown in the modal, not the card. */}
                    <span className="hidden" data-cms-field="details">{comp.details}</span>
                    <span className="hidden" data-cms-field="rules_document">{comp.rules_document}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-2xl border border-navy/10 bg-white/60 px-6 py-10 text-center">
              <p className="font-display text-lg font-semibold text-navy" data-cms="Events - Competitions - Empty Heading">{c.events_competitions_empty_heading}</p>
              <p className="mt-1.5 text-sm text-navy/60" data-cms="Events - Competitions - Empty Body">{c.events_competitions_empty_body}</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter signup — posts subscribers to the Pubd CMS */}
      <NewsletterSignup />

      {/* Facebook note */}
      <section>
        <div className="section text-center">
          <AnimatedSection>
            <p className="text-lg font-semibold text-navy" data-cms="Events - Facebook - Note">{c.events_facebook_note}</p>
            <a href={c.socials[0]?.url} target="_blank" rel="noopener noreferrer" className="btn-outline mt-5">
              <span data-cms="Events - Social - CTA">{c.events_social_cta}</span>
            </a>
          </AnimatedSection>
        </div>
      </section>

      {/* Competition details modal */}
      {comp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={() => setOpenComp(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenComp(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy shadow ring-1 ring-navy/10 transition hover:bg-white"
            >
              ✕
            </button>
            {comp.image && (
              <div className="aspect-[16/9] w-full overflow-hidden bg-navy/5">
                <img src={comp.image} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-6 sm:p-7">
              <h3 className="font-display text-2xl font-semibold text-navy">{comp.title}</h3>
              <p className="mt-3 whitespace-pre-line text-navy/75">{comp.details}</p>
              {comp.rules_document ? (
                <a
                  href={comp.rules_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-6 inline-flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" />
                  </svg>
                  <span data-cms="Events - Rules - Download Label">{c.events_rules_download_label}</span>
                </a>
              ) : (
                <p className="mt-6 text-sm italic text-navy/45" data-cms="Events - Rules - Empty">{c.events_rules_empty}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
