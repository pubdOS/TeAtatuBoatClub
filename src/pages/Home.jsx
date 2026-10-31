import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import c from '../../content.js'
import SmartLink from '../components/SmartLink.jsx'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import Sections, { Section } from '../components/Sections.jsx'
import HeroPhotos from '../kit/HeroPhotos.jsx'

/**
 * Is a time-boxed promotion still running?
 *
 * `home_promo_ends` is NZ wall-clock time ("2026-11-01 17:00") because that is
 * what the club means by "5pm Sunday", but a visitor's device can be in any
 * timezone, and NZ itself changes offset in late September (NZST +12 to NZDT
 * +13). So neither the visitor's local clock nor a hardcoded +12:00 is right.
 *
 * Format the moment into NZ wall-clock time and compare the two as strings. Intl
 * knows the DST rules, and the YYYY-MM-DD HH:mm shape sorts correctly as text.
 *
 * content.js cannot hold a computed value (the scanner forbids it), which is why
 * the end time is a plain string field and this lives here.
 */
function promoIsLive(ends, at) {
  if (!ends) return false
  try {
    const nz = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(at).replace(',', '')
    return nz < ends.trim()
  } catch {
    return false
  }
}

export default function Home() {
  // The hero promotion (2026-10-18, replaced the old pop-up). While
  // `home_promo_ends` is in the future the hero shows the promo; after it, the
  // normal hero comes back on its own, with no edit and no deploy.
  //
  // The page is prerendered, so the first render must match the HTML the build
  // produced: start from the BUILD time (the same value on the server and in the
  // browser), then re-check against the visitor's clock once mounted. A promo
  // that ended after the last deploy therefore swaps back a moment after load.
  const [promo, setPromo] = useState(() => promoIsLive(c.home_promo_ends, new Date(__BUILT_AT__)))
  useEffect(() => { setPromo(promoIsLive(c.home_promo_ends, new Date())) }, [])

  return (
    <>
      <Seo title={c.home_seo_title} description={c.home_seo_description} />
      <span hidden data-cms="Home - SEO - Page Title">{c.home_seo_title}</span>
      <span hidden data-cms="Home - SEO - Meta Description">{c.home_seo_description}</span>
      {/* Section order: which sections show, in what order (Sections.jsx). The
          hero stays put; everything below it can be hidden and moved. */}
      <span hidden data-cms="Home - Page - Layout">{c.home_page_layout}</span>
      {/* Sections added from the kit: one JSON field for the page. */}
      <span hidden data-cms="Home - Page - Kit">{c.home_page_kit}</span>
      {/* ─── Hero ───
          While a promotion is running (Home - Promo - Ends, NZ time) it takes the
          hero; clear the end time, or let it pass, and the normal hero returns. */}
      <span hidden data-cms="Home - Promo - Ends">{c.home_promo_ends}</span>
      {promo ? (
        <section className="relative isolate flex min-h-[80vh] items-end overflow-hidden bg-navy-dark text-white md:items-center">
          <img
            src={c.home_promo_image}
            data-cms="Home - Promo - Image"
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[25%_center]"
          />
          {/* Scrim: from the bottom on a phone (text sits low), from the right on
              wider screens, where the copy sits over open sea and sky. */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent md:bg-gradient-to-l md:from-navy-dark/90 md:via-navy-dark/55 md:to-transparent" />
          {/* Fades the photo into the navy wave below on every width. */}
          <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-navy-dark to-transparent" />
          <div className="mx-auto flex w-full max-w-6xl justify-end px-5 pb-20 pt-40 md:py-24">
            <div className="w-full max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold" data-cms="Home - Promo - Label">
                {c.home_promo_label}
              </p>
              <h1 className="mt-4">
                {/* Fixed 15:4 box (the logo's own shape), contained: a replacement logo of any shape stays inside it. */}
                <span className="block aspect-[15/4] w-full max-w-md">
                  <img src={c.home_promo_logo} data-cms="Home - Promo - Logo" alt="" className="h-full w-full object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]" />
                </span>
                <span className="sr-only" data-cms="Home - Promo - Title">{c.home_promo_title}</span>
              </h1>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white md:text-base" data-cms="Home - Promo - Date">
                {c.home_promo_date}
              </p>
              <p className="mt-5 max-w-lg text-lg text-white/80 whitespace-pre-line" data-cms="Home - Promo - Sub">
                {c.home_promo_sub}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <SmartLink to={c.home_promo_cta1_link} className="btn-primary" data-cms="Home - Promo - CTA 1">
                  {c.home_promo_cta1}
                </SmartLink>
                <span hidden data-cms="Home - Promo - CTA 1 Link">{c.home_promo_cta1_link}</span>
                <SmartLink to={c.home_promo_cta2_link} className="btn-secondary" data-cms="Home - Promo - CTA 2">
                  {c.home_promo_cta2}
                </SmartLink>
                <span hidden data-cms="Home - Promo - CTA 2 Link">{c.home_promo_cta2_link}</span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative isolate flex min-h-[80vh] items-center bg-navy text-white">
          {/* The hero photo, then any added under "More Photos", taking turns
              (HeroPhotos, shared kit). Each has a hidden companion the CMS edits. */}
          <HeroPhotos image={c.home_hero_image} more={c.home_hero_more} className="absolute inset-0 -z-10 opacity-40" />
          <img src={c.home_hero_image} data-cms="Home - Hero - Image" alt="" className="hidden" />
          <div hidden data-cms-repeater="Home - Hero - More Photos" data-cms-shape="media" data-cms-max="5"
            data-cms-note="These take turns with the hero photo, a few seconds each.">
            {(c.home_hero_more || []).map((x, i) => (
              <div key={i}><img data-cms-field="image" src={x.image} alt="" loading="lazy" /></div>
            ))}
          </div>
          <div className="mx-auto max-w-6xl px-5 py-24">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl" data-cms="Home - Hero - Heading">
              {c.home_hero_heading}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/80 whitespace-pre-line" data-cms="Home - Hero - Sub">
              {c.home_hero_sub}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <SmartLink to={c.home_hero_cta1_link} className="btn-primary" data-cms="Home - Hero - CTA 1">
                {c.home_hero_cta1}
              </SmartLink>
              <span hidden data-cms="Home - Hero - CTA 1 Link">{c.home_hero_cta1_link}</span>
              <SmartLink to={c.home_hero_cta2_link} className="btn-secondary" data-cms="Home - Hero - CTA 2">
                {c.home_hero_cta2}
              </SmartLink>
              <span hidden data-cms="Home - Hero - CTA 2 Link">{c.home_hero_cta2_link}</span>
            </div>
          </div>
        </section>
      )}

      {/* maritime transition from the hero into the content */}
      <WaveDivider top={promo ? '#071a33' : undefined} />

      <Sections layout={c.home_page_layout} tones={['alt', 'base']} page="Home" kit={c.home_page_kit}>
      {/* ─── Stats (repeater — static container anchors section order) ─── */}
      <Section id="Home - Stats">
        <div data-cms-repeater="Home - Stats" data-cms-shape="stat" data-cms-min="2" data-cms-recommend="3" data-cms-max="6" data-cms-overflow="wrap" className="repeat-balance [--rb-cols:1] sm:[--rb-cols:3] [--rb-gap:2rem] mx-auto max-w-6xl gap-8 px-5 py-14">
          {c.home_stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-5xl font-semibold text-accent" data-cms-field="value">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy/55" data-cms-field="label">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── About strip ─── */}
      <Section id="Home - About">
      <div className="section grid items-center gap-12 md:grid-cols-2">
        <AnimatedSection>
          <span className="eyebrow" data-cms="Home - About - Label">{c.home_about_label}</span>
          <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Home - About - Heading">
            {c.home_about_heading}
          </h2>
          <p className="mt-4 text-navy/70 whitespace-pre-line" data-cms="Home - About - Body">{c.home_about_body}</p>
          <SmartLink to={c.home_about_cta_link} className="btn-outline mt-6" data-cms="Home - About - CTA">
            {c.home_about_cta}
          </SmartLink>
          <span hidden data-cms="Home - About - CTA Link">{c.home_about_cta_link}</span>
        </AnimatedSection>
        <AnimatedSection delay={120}>
          <img
            src={c.home_about_image}
            data-cms="Home - About - Image"
            alt="The club"
            className="aspect-[4/3] w-full rounded-2xl bg-navy/5 object-cover"
          />
        </AnimatedSection>
      </div>
      </Section>

      {/* ─── Video (promo clip, not the hero) ─── */}
      <Section id="Home - Video" pin="navy-dark" className="bg-navy-dark">
        <div className="section">
          <AnimatedSection className="mb-8 text-center text-white">
            <span className="eyebrow text-gold" data-cms="Home - Video - Label">{c.home_video_label}</span>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Home - Video - Heading">
              {c.home_video_heading}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/70" data-cms="Home - Video - Sub">
              {c.home_video_sub}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={120}>
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <video
                className="aspect-video w-full bg-black"
                src={c.home_video}
                poster={c.home_video_poster}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="auto"
              />
            </div>
          </AnimatedSection>
        </div>
      </Section>

      {/* ─── Facilities (repeater) ─── */}
      <Section id="Home - Facilities">
        <div className="section">
          <AnimatedSection className="mb-10 text-center">
            <span className="eyebrow" data-cms="Home - Facilities - Label">{c.home_facilities_label}</span>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Home - Facilities - Heading">
              {c.home_facilities_heading}
            </h2>
          </AnimatedSection>
          <div data-cms-repeater="Home - Facilities - Facilities" data-cms-shape="card" data-cms-min="2" data-cms-recommend="3" data-cms-max="6" data-cms-overflow="wrap" className="repeat-balance [--rb-cols:1] md:[--rb-cols:3] gap-6">
            {c.home_facilities.map((f, i) => (
              <div key={i} className="card p-7">
                <span className="mb-4 block h-1 w-10 rounded bg-gold" />
                <h3 className="font-display text-xl font-semibold" data-cms-field="title">{f.title}</h3>
                <p className="mt-2 text-navy/70 whitespace-pre-line" data-cms-field="desc">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <SmartLink to={c.home_facilities_cta_link} className="btn-outline" data-cms="Home - Facilities - CTA">
              {c.home_facilities_cta}
            </SmartLink>
            <span hidden data-cms="Home - Facilities - CTA Link">{c.home_facilities_cta_link}</span>
          </div>
        </div>
      </Section>

      {/* ─── CTA banner ─── */}
      <Section id="Home - CTA" pin="navy" className="bg-navy text-white">
        <div className="section text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Home - CTA - Heading">
              {c.home_cta_heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80" data-cms="Home - CTA - Body">
              {c.home_cta_body}
            </p>
            <SmartLink to={c.home_cta_button_link} className="btn-primary mt-8" data-cms="Home - CTA - Button">
              {c.home_cta_button}
            </SmartLink>
            <span hidden data-cms="Home - CTA - Button Link">{c.home_cta_button_link}</span>
          </AnimatedSection>
        </div>
      </Section>
      </Sections>
    </>
  )
}
