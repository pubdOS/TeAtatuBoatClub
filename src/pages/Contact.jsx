import { useState } from 'react'
import c from '../../content.js'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'

const encode = (data) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&')

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // Submits to Netlify Forms (form "contact", declared in index.html).
  // Submissions collect in the Netlify dashboard — email notifications are OFF,
  // so nothing is sent to the club. Falls back to a mailto link on failure.
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const form = e.target
    const data = new FormData(form)
    if (data.get('bot-field')) return // honeypot tripped
    setSending(true)
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'contact',
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      })
      if (!res.ok) throw new Error('bad status')
      setSent(true)
    } catch {
      setError('Something went wrong sending your message. Please email us directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Seo title={c.contact_seo_title} description={c.contact_seo_description} />
      <span hidden data-cms="Contact - SEO - Page Title">{c.contact_seo_title}</span>
      <span hidden data-cms="Contact - SEO - Meta Description">{c.contact_seo_description}</span>
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Contact - Hero - Heading">
            {c.contact_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Contact - Hero - Sub">{c.contact_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      <section className="section grid gap-12 md:grid-cols-2">
        {/* Office details */}
        <AnimatedSection>
          <h2 className="text-2xl font-semibold" data-cms="Contact - Office - Heading">
            {c.contact_office_heading}
          </h2>
          <dl className="mt-6 space-y-4 text-navy/80">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy/40" data-cms-static="label for the editable email field beside it">Email</dt>
              <dd>
                <a href={`mailto:${c.contact_office_email}`} className="hover:text-accent" data-cms="Contact - Office - Email">
                  {c.contact_office_email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy/40" data-cms-static="label for the editable phone field beside it">Phone</dt>
              <dd>
                <a href={`tel:${c.contact_office_phone.replace(/\s/g, '')}`} className="hover:text-accent" data-cms="Contact - Office - Phone">
                  {c.contact_office_phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy/40" data-cms-static="label for the editable address field beside it">Address</dt>
              <dd data-cms="Contact - Office - Address">{c.contact_office_address}</dd>
            </div>
          </dl>
          <div className="mt-8 overflow-hidden rounded-2xl border border-navy/10">
            <iframe
              title="Map"
              src={c.contact_map_embed}
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </AnimatedSection>

        {/* Enquiry form */}
        <AnimatedSection delay={120}>
          <div className="rounded-2xl bg-sand p-7">
            <h2 className="text-2xl font-semibold" data-cms="Contact - Form - Heading">
              {c.contact_form_heading}
            </h2>
            {sent ? (
              <p className="mt-6 rounded-xl bg-accent/10 p-4 text-sm text-accent-dark" data-cms="Contact - Form - Success Body">{c.contact_form_success_body}</p>
            ) : (
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                {/* Honeypot — hidden from humans, bots fill it and get dropped */}
                <p className="hidden">
                  <label data-cms-static="Netlify honeypot — hidden from visitors, must stay fixed">Don’t fill this out: <input name="bot-field" /></label>
                </p>
                <input name="name" required placeholder="Your name" className="w-full rounded-xl border border-navy/15 px-4 py-3 focus:border-accent focus:outline-none" />
                <input name="email" type="email" required placeholder="Your email" className="w-full rounded-xl border border-navy/15 px-4 py-3 focus:border-accent focus:outline-none" />
                <textarea name="message" required rows={5} placeholder="How can we help?" className="w-full rounded-xl border border-navy/15 px-4 py-3 focus:border-accent focus:outline-none" />
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60">
                  <span data-cms-static="transient form state, not page copy" hidden={!sending}>Sending…</span>
                  <span data-cms="Contact - Form - Submit" hidden={sending}>{c.contact_form_submit}</span>
                </button>
              </form>
            )}
          </div>
        </AnimatedSection>
      </section>
    </>
  )
}
