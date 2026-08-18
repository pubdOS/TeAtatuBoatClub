import c from '../../content.js'
import BookingWidget from '../booking/BookingWidget.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import Seo from '../components/Seo.jsx'

// The ONLY CMS-editable content on this page is the static framing text below
// (heading, "how it works", and the two notices). Everything inside
// <BookingWidget> is dynamic application UI and carries NO data-cms attributes.
//
// The content.js values are passed into the widget as fallback defaults; the
// widget also fetches the live versions from the CMS API at runtime.
export default function Booking() {
  return (
    <>
      <Seo title={c.booking_seo_title} description={c.booking_seo_description} />
      <span hidden data-cms="Booking - SEO - Page Title">{c.booking_seo_title}</span>
      <span hidden data-cms="Booking - SEO - Meta Description">{c.booking_seo_description}</span>
      <section className="bg-navy py-16 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Booking - Hero - Heading">
            {c.booking_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Booking - Hero - Sub">{c.booking_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      <section className="section mx-auto max-w-5xl">
        <div className="mb-10 rounded-2xl border border-navy/10 bg-sand p-6">
          <h2 className="text-xl font-bold" data-cms="Booking - How - Heading">{c.booking_how_heading}</h2>
          <p className="mt-2 text-sm text-navy/70" data-cms="Booking - How - Body">{c.booking_how_body}</p>
        </div>

        {/* ── Hidden static notice fields so the CMS can discover + edit them. ──
            The widget reads the live versions at runtime; these elements exist
            purely so the scanner registers the keys. */}
        <div hidden>
          <p data-cms="Booking - Notice - Charge">{c.booking_notice_charge}</p>
          <p data-cms="Booking - Notice - Cancellation">{c.booking_notice_cancellation}</p>
        </div>

        {/* Dynamic booking application — NO data-cms inside. Gated by content.js
            `booking_live`: flip to true once the members list is loaded into
            Supabase (before that, members would hit a "can't confirm membership"
            dead-end). Until then, a friendly "opening soon" pointing to the office. */}
        {c.booking_live ? (
          <BookingWidget
            fallback={{
              chargeNotice: c.booking_notice_charge,
              cancelNotice: c.booking_notice_cancellation,
              officeEmail: c.contact_office_email,
              rate: c.pricing_workbay_member_booked_rate,
              unit: c.pricing_workbay_unit,
            }}
          />
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-navy">Online booking is opening soon</h2>
            <p className="mt-3 leading-relaxed text-navy/70">
              We're putting the finishing touches on the new online work-bay booking system. In the meantime, please contact the office to book a bay and we'll get you sorted.
            </p>
            <div className="mt-6 flex flex-col items-center gap-1.5 text-sm">
              <a href={`mailto:${c.contact_office_email}`} className="font-semibold text-accent hover:underline">{c.contact_office_email}</a>
              <a href={`tel:${c.contact_office_phone.replace(/[^0-9+]/g, '')}`} className="text-navy/70 hover:text-accent">{c.contact_office_phone}</a>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
