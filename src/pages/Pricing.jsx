import { Link } from 'react-router-dom'
import c from '../../content.js'
import SmartLink from '../components/SmartLink.jsx'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'

// IMPORTANT: work-bay rates are STATIC data-cms fields (not a repeater) so the
// keys stay stable and the booking flow can fetch a specific rate at runtime.
export default function Pricing() {
  return (
    <>
      <Seo title={c.pricing_seo_title} description={c.pricing_seo_description} />
      <span hidden data-cms="Pricing - SEO - Page Title">{c.pricing_seo_title}</span>
      <span hidden data-cms="Pricing - SEO - Meta Description">{c.pricing_seo_description}</span>
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Pricing - Hero - Heading">
            {c.pricing_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Pricing - Hero - Sub">{c.pricing_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      {/* Work-bay pricing — canonical, fetchable keys */}
      <section className="section">
        <AnimatedSection className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-semibold md:text-3xl" data-cms="Pricing - Work Bay - Heading">
            {c.pricing_workbay_heading}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative rounded-2xl border-2 border-gold bg-gold/10 p-6 text-center">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-navy" data-cms="Pricing - Work Bay - Badge">{c.pricing_workbay_badge}</span>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark" data-cms="Pricing - Work Bay - Member Booked Label">{c.pricing_workbay_member_booked_label}</p>
              <p className="mt-2 text-4xl font-semibold text-navy">
                <span data-cms="Pricing - Work Bay - Member Booked Rate">{c.pricing_workbay_member_booked_rate}</span>
              </p>
              <p className="text-sm text-navy/60" data-cms="Pricing - Work Bay - Unit">{c.pricing_workbay_unit}</p>
            </div>
            <div className="rounded-2xl border border-navy/10 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/50" data-cms="Pricing - Work Bay - Member Unbooked Label">{c.pricing_workbay_member_unbooked_label}</p>
              <p className="mt-2 text-4xl font-semibold text-navy/70">
                <span data-cms="Pricing - Work Bay - Member Unbooked Rate">{c.pricing_workbay_member_unbooked_rate}</span>
              </p>
              <p className="text-sm text-navy/50">{c.pricing_workbay_unit}</p>
            </div>
            <div className="rounded-2xl border border-navy/10 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/50" data-cms="Pricing - Work Bay - Non-member Label">{c.pricing_workbay_nonmember_label}</p>
              <p className="mt-2 text-4xl font-semibold text-navy/70">
                <span data-cms="Pricing - Work Bay - Non-member Rate">{c.pricing_workbay_nonmember_rate}</span>
              </p>
              <p className="text-sm text-navy/50">{c.pricing_workbay_unit}</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-navy/60" data-cms="Pricing - Work Bay - Note">
            {c.pricing_workbay_note}
          </p>
          <p className="mt-1 text-center text-xs text-navy/40" data-cms="Pricing - Work Bay - Currency Note">
            {c.pricing_currency_note}
          </p>
          <div className="mt-6 text-center">
            <SmartLink to={c.pricing_cta_button_link} className="btn-primary" data-cms="Pricing - CTA - Button">{c.pricing_cta_button}</SmartLink>
            <span hidden data-cms="Pricing - CTA - Button Link">{c.pricing_cta_button_link}</span>
          </div>
        </AnimatedSection>
      </section>

      {/* Other fees (repeater) */}
      <section className="bg-sand">
        <div className="section mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-semibold" data-cms="Pricing - Other - Heading">
            {c.pricing_other_heading}
          </h2>
          {/* Column headings. Outside the repeater so they are ONE editable pair
              rather than a duplicate key on every row. Hidden on mobile, where
              each row carries its own inline labels instead. */}
          <div className="hidden px-5 pb-2 text-[11px] uppercase tracking-wider text-navy/45 sm:grid sm:grid-cols-[1fr_8rem_8rem] sm:gap-x-6">
            <span />
            <span className="text-right" data-cms="Pricing - Other - Member Label">{c.pricing_other_member_label}</span>
            <span className="text-right" data-cms="Pricing - Other - Nonmember Label">{c.pricing_other_nonmember_label}</span>
          </div>
          <div data-cms-repeater="Pricing - Other" data-cms-shape="list" data-cms-min="1" data-cms-overflow="wrap" className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {c.pricing_other.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-navy/5 px-5 py-3.5 last:border-0 sm:grid-cols-[1fr_8rem_8rem] sm:items-baseline sm:gap-x-6">
                <span className="col-span-2 text-sm text-navy/80 sm:col-span-1" data-cms-field="item">{row.item}</span>
                {/* `sm:contents` dissolves these wrappers into the parent grid on
                    desktop, so the rates line up under their headings; on mobile
                    they stay as cells so each rate keeps its own label. */}
                <div className="sm:contents">
                  <span className="block text-[11px] uppercase tracking-wider text-navy/45 sm:hidden" data-cms-static="Column label repeated on every row; a data-cms here would be a duplicate key per item">Member</span>
                  <span className="block text-sm font-semibold text-navy sm:text-right" data-cms-field="member_rate">{row.member_rate}</span>
                </div>
                <div className="sm:contents">
                  <span className="block text-[11px] uppercase tracking-wider text-navy/45 sm:hidden" data-cms-static="Column label repeated on every row; a data-cms here would be a duplicate key per item">Non-member</span>
                  <span className="block text-sm text-navy/70 sm:text-right" data-cms-field="nonmember_rate">{row.nonmember_rate}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-navy/60" data-cms="Pricing - Notice - Body">{c.pricing_notice}</p>
        </div>
      </section>
    </>
  )
}
