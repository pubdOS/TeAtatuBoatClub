import { Link } from 'react-router-dom'
import c from '../../content.js'
import SmartLink from '../components/SmartLink.jsx'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'

export default function About() {
  return (
    <>
      <Seo title={c.about_seo_title} description={c.about_seo_description} />
      <span hidden data-cms="About - SEO - Page Title">{c.about_seo_title}</span>
      <span hidden data-cms="About - SEO - Meta Description">{c.about_seo_description}</span>
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="About - Hero - Heading">
            {c.about_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="About - Hero - Sub">{c.about_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      {/* Story */}
      <section className="section grid items-center gap-12 md:grid-cols-2">
        <AnimatedSection>
          <span className="eyebrow" data-cms="About - Hero - Eyebrow">{c.about_hero_eyebrow}</span>
          <h2 className="text-3xl font-semibold md:text-4xl" data-cms="About - Story - Heading">
            {c.about_story_heading}
          </h2>
          <p className="mt-4 leading-relaxed text-navy/70 whitespace-pre-line" data-cms="About - Story - Body">{c.about_story_body}</p>
        </AnimatedSection>
        <AnimatedSection delay={120}>
          <img
            src={c.about_story_image}
            data-cms="About - Story - Image"
            alt="The club"
            className="aspect-[4/3] w-full rounded-2xl bg-navy/5 object-cover shadow-md"
          />
        </AnimatedSection>
      </section>

      {/* Committee (repeater) — now above the community note */}
      <section className="bg-sand">
        <div className="section">
          <AnimatedSection className="mb-10 text-center">
            <span className="eyebrow justify-center" data-cms="About - Committee - Label">{c.about_committee_label}</span>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="About - Committee - Heading">
              {c.about_committee_heading}
            </h2>
          </AnimatedSection>
          <div data-cms-repeater="About - Committee" data-cms-shape="person" data-cms-min="3" data-cms-recommend="6" data-cms-max="12" data-cms-overflow="wrap" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {c.committee.map((m, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy font-display text-xl font-semibold text-gold">
                  {(m.name || '?').charAt(0)}
                </div>
                <h3 className="font-display text-lg font-semibold" data-cms-field="name">{m.name}</h3>
                <p className="text-sm font-semibold text-accent" data-cms-field="role">{m.role}</p>
                <a href={`mailto:${m.email}`} className="mt-2 block text-sm text-navy/55 hover:text-accent" data-cms-field="email">
                  {m.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community note (elevated growth paragraph) */}
      <section className="section">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <span className="mx-auto mb-5 block h-1 w-12 rounded bg-gold" />
          <p className="font-display text-2xl font-medium leading-relaxed text-navy/85 md:text-3xl whitespace-pre-line" data-cms="About - Growth - Body">
            {c.about_growth_body}
          </p>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <WaveDivider top="#fbf8f2" bottom="#0b2545" />
      <section className="bg-navy text-white">
        <div className="section text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="About - CTA - Heading">
              {c.about_cta_heading}
            </h2>
            <SmartLink to={c.about_cta_button_link} className="btn-primary mt-8" data-cms="About - CTA - Button">
              {c.about_cta_button}
            </SmartLink>
            <span hidden data-cms="About - CTA - Button Link">{c.about_cta_button_link}</span>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
