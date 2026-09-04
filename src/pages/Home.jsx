import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import c from '../../content.js'
import SmartLink from '../components/SmartLink.jsx'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import Lightbox from '../components/Lightbox.jsx'

/**
 * Is the announcement still running?
 *
 * `home_announcement_ends` is NZ wall-clock time ("2026-09-06 20:00") because
 * that is what the club means by "8pm Sunday" — but a visitor's device can be in
 * any timezone, and NZ itself changes offset in late September (NZST +12 → NZDT
 * +13). So neither the visitor's local clock nor a hardcoded +12:00 is right.
 *
 * Format NOW into NZ wall-clock time and compare the two as strings. Intl knows
 * the DST rules, so this keeps working for a summer announcement, and the
 * YYYY-MM-DD HH:mm shape sorts correctly as text. No library, no date parsing.
 *
 * content.js cannot hold a computed value (the scanner forbids it), which is why
 * the end time is a plain string field and this lives here.
 */
function announcementIsLive(ends) {
  if (!ends) return false
  try {
    const nzNow = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date()).replace(',', '')
    return nzNow < ends.trim()
  } catch {
    // Intl without tz data is not a reason to spam every visitor forever.
    return false
  }
}

export default function Home() {
  // The announcement pop-up. Reuses Lightbox — the same viewer the dining and
  // catering menus already open into — so it looks native rather than bolted on,
  // and adds no new file to a repo that is already at the scanner's 30-file cap.
  const [announcement, setAnnouncement] = useState(null)
  const menu = c.home_announcement_image
  const ends = c.home_announcement_ends

  useEffect(() => {
    if (!menu || !announcementIsLive(ends)) return
    // SESSION, not device. Remembering a dismissal forever is right for something
    // running for weeks; for a three-day weekend special it means anyone who
    // glances at it on the Friday and closes it has opted out of the whole
    // promotion. Per session, it stays gone while they browse around, and comes
    // back on their next visit — which for a Friday-to-Sunday run is the point.
    //
    // Keyed by the END TIME, so the NEXT announcement still shows to someone who
    // dismissed this one. A fixed key would quietly suppress every future
    // announcement for anyone who ever closed one.
    const key = `tabc-announcement-${ends}`
    try {
      if (sessionStorage.getItem(key)) return
    } catch {
      // Safari private mode throws on access rather than returning null. Not a
      // reason to withhold the announcement — just show it and skip remembering.
    }
    setAnnouncement(0)
  }, [menu, ends])

  // Lightbox calls its setter BOTH ways: `setIndex(null)` to close, and
  // `setIndex(i => …)` for the arrow keys. Treating every call as a dismiss
  // meant pressing an arrow key closed the announcement and marked it seen.
  // Only an actual close counts.
  const onAnnouncementChange = (next) => {
    const value = typeof next === 'function' ? next(announcement) : next
    if (value !== null) { setAnnouncement(value); return }
    setAnnouncement(null)
    try { sessionStorage.setItem(`tabc-announcement-${ends}`, '1') } catch { /* see above */ }
  }

  return (
    <>
      <Seo title={c.home_seo_title} description={c.home_seo_description} />
      <span hidden data-cms="Home - SEO - Page Title">{c.home_seo_title}</span>
      <span hidden data-cms="Home - SEO - Meta Description">{c.home_seo_description}</span>
      {/* ─── Hero ─── */}
      <section className="relative isolate flex min-h-[80vh] items-center bg-navy text-white">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${c.home_hero_image})` }}
        />
        <img src={c.home_hero_image} data-cms="Home - Hero - Image" alt="" className="hidden" />
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

      {/* maritime transition from the hero into the content */}
      <WaveDivider bottom="#f2eada" />

      {/* ─── Stats (repeater — static container anchors section order) ─── */}
      <section className="bg-sand">
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
      </section>

      {/* ─── About strip ─── */}
      <section className="section grid items-center gap-12 md:grid-cols-2">
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
      </section>

      {/* ─── Video (promo clip, not the hero) ─── */}
      <section className="bg-navy-dark">
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
      </section>

      {/* ─── Facilities (repeater) ─── */}
      <section className="bg-sand">
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
      </section>

      {/* ─── CTA banner ─── */}
      <section className="bg-navy text-white">
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
      </section>

      {/* ─── Announcement ───────────────────────────────────────────────────
          Set an image and an end time in the CMS and it pops up once per
          visitor until that time passes. CLEAR THE IMAGE to take it down — that
          also stops it being downloaded, which is why the <img> below is inside
          this guard rather than always rendered. */}
      {menu && (
        <>
          {/* Declares the fields for the scanner. Hidden: the pop-up is the
              only place these are actually shown. */}
          {/* src MUST be `c.<key>` literally, not the `menu` alias above. The
              scanner resolves an image field by matching `src={c.something}` in
              the source; anything else scans as EMPTY and, worse, gets no content
              path — so the club could change the image in the CMS and publishing
              would never write it back to content.js. The alias is fine for the
              logic above, which the scanner never reads. */}
          <img src={c.home_announcement_image} data-cms="Home - Announcement - Image" alt="" className="hidden" />
          <span hidden data-cms="Home - Announcement - Ends">{c.home_announcement_ends}</span>
          <span hidden data-cms="Home - Announcement - Alt">{c.home_announcement_alt}</span>
          <Lightbox
            items={[menu]}
            index={announcement}
            setIndex={onAnnouncementChange}
            label={c.home_announcement_alt}
          />
        </>
      )}
    </>
  )
}
