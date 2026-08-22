import { Link } from 'react-router-dom'
import c from '../../content.js'
import SmartLink from '../components/SmartLink.jsx'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'

export default function Membership() {
  return (
    <>
      <Seo title={c.membership_seo_title} description={c.membership_seo_description} />
      <span hidden data-cms="Membership - SEO - Page Title">{c.membership_seo_title}</span>
      <span hidden data-cms="Membership - SEO - Meta Description">{c.membership_seo_description}</span>
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Membership - Hero - Heading">
            {c.membership_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Membership - Hero - Sub">{c.membership_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      <section className="section mx-auto max-w-3xl text-center">
        <AnimatedSection>
          <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Membership - Intro - Heading">
            {c.membership_intro_heading}
          </h2>
          <p className="mt-4 text-navy/70 whitespace-pre-line" data-cms="Membership - Intro - Body">{c.membership_intro_body}</p>
        </AnimatedSection>

        {/* Fees */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-accent bg-accent/5 p-6">
            <p className="text-4xl font-semibold text-navy">
              <span data-cms="Membership - Family - Fee">{c.membership_family_fee}</span>{' '}
              <span className="text-base font-semibold text-navy/50" data-cms="Membership - Family - Unit">{c.membership_family_unit}</span>
            </p>
            <p className="mt-2 text-sm text-navy/60" data-cms="Membership - Family - Note">{c.membership_family_note}</p>
          </div>
          <div className="rounded-2xl border border-navy/10 p-6">
            <p className="text-4xl font-semibold text-navy">
              <span data-cms="Membership - Nomination - Fee">{c.membership_nomination_fee}</span>
            </p>
            <p className="mt-2 text-sm text-navy/60" data-cms="Membership - Nomination - Note">{c.membership_nomination_note}</p>
          </div>
        </div>
      </section>

      {/* How to join (repeater) */}
      <section className="section pt-0 mx-auto max-w-4xl">
        <AnimatedSection className="mb-8 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl" data-cms="Membership - How - Heading">
            {c.membership_how_heading}
          </h2>
        </AnimatedSection>
        <div data-cms-repeater="Membership - Steps" data-cms-shape="list" data-cms-min="2" data-cms-recommend="4" data-cms-max="6" data-cms-overflow="wrap" className="cms-count-root grid gap-5 sm:grid-cols-2">
          {c.membership_steps.map((s, i) => (
            <div key={i} className="card p-6">
              <span className="cms-count flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white" />
              <h3 className="mt-3 text-lg font-bold" data-cms-field="step">{s.step}</h3>
              <p className="mt-1 text-sm text-navy/70 whitespace-pre-line" data-cms-field="desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand">
        <div className="section">
          <div data-cms-repeater="Membership - Benefits" data-cms-shape="card" data-cms-min="2" data-cms-recommend="4" data-cms-max="8" data-cms-overflow="wrap" className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {c.membership_benefits.map((b, i) => (
              <div key={i} className="card p-6 text-center">
                <h3 className="text-lg font-bold" data-cms-field="title">{b.title}</h3>
                <p className="mt-2 text-sm text-navy/70 whitespace-pre-line" data-cms-field="desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="section text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Membership - CTA - Heading">
              {c.membership_cta_heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80" data-cms="Membership - CTA - Body">
              {c.membership_cta_body}
            </p>
            <SmartLink to={c.membership_cta_button_link} className="btn-primary mt-8" data-cms="Membership - CTA - Button">
              {c.membership_cta_button}
            </SmartLink>
            <span hidden data-cms="Membership - CTA - Button Link">{c.membership_cta_button_link}</span>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
