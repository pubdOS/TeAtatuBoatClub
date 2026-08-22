import { useState } from 'react'
import c from '../../content.js'

// Posts new subscribers to the Pubd CMS (which owns the list + sending).
// The client id scopes the subscription to this club; it's not a secret.
const CMS_URL = 'https://cms.pubd.io'
const CLIENT_ID = '514ae72b-9328-4189-9617-ab0f62ddefbc'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [hp, setHp] = useState('') // honeypot — bots fill it, humans don't
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const res = await fetch(`${CMS_URL}/api/public/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: CLIENT_ID, email: email.trim(), name: name.trim(), hp }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return }
      setDone(true)
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="bg-navy">
      <div className="section mx-auto max-w-xl text-center text-white">
        <h2 className="font-display text-2xl font-semibold" data-cms="Events - Signup - Heading">{c.newsletter_signup_heading}</h2>
        <p className="mt-2 text-white/75" data-cms="Events - Signup - Sub">{c.newsletter_signup_sub}</p>

        {done ? (
          <p className="mt-6 text-lg font-medium text-gold" data-cms="Events - Signup - Success">{c.newsletter_signup_success}</p>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            {/* honeypot — visually hidden */}
            <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
            <button type="submit" disabled={busy} className="btn-primary shrink-0 disabled:opacity-60" data-cms="Events - Signup - Button">
              {busy ? 'Subscribing…' : c.newsletter_signup_button}
            </button>
          </form>
        )}
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </div>
    </section>
  )
}
