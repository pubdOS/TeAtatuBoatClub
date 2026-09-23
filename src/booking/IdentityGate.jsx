import { useState } from 'react'
import { validateMember } from './api.js'

// Step 1 — confirm the person is a current member (name + membership number).
// This is a convenience gate; create-booking re-validates server-side.
export default function IdentityGate({ onValidated }) {
  const [fullName, setFullName] = useState('')
  const [membershipNumber, setMembershipNumber] = useState('')
  const [largeVessel, setLargeVessel] = useState(null) // null until chosen; true = ≥10m
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (largeVessel === null) {
      setError('Please tell us your boat size so we can allocate the right bays.')
      return
    }
    setBusy(true)
    try {
      const res = await validateMember(fullName.trim(), membershipNumber.trim())
      if (res.ok) {
        onValidated({
          fullName: fullName.trim(),
          membershipNumber: membershipNumber.trim(),
          largeVessel,
          // Carried through so the confirm step knows whether to ASK for an
          // address or merely offer to change the one on file.
          hasEmail: !!res.member?.hasEmail,
          emailHint: res.member?.emailHint || null,
        })
      } else {
        setError(res.error || "We couldn't match those details.")
      }
    } catch {
      setError('Could not reach the booking service. Please try again shortly.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-navy/10 bg-white p-7 shadow-sm">
      <h2 className="text-xl font-bold text-navy">Confirm your membership</h2>
      <p className="mt-1 text-sm text-navy/60">
        Bookings are for current club members. Enter your details to continue.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="w-full rounded-xl border border-navy/15 px-4 py-3"
            placeholder="As it appears on your membership"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Membership number</label>
          <input
            value={membershipNumber}
            onChange={(e) => setMembershipNumber(e.target.value)}
            required
            inputMode="numeric"
            className="w-full rounded-xl border border-navy/15 px-4 py-3"
            placeholder="e.g. 1234"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">Boat size</label>
          <p className="mb-2 text-xs text-navy/55">Vessels 10m or longer need two work bays for the day.</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: false, label: 'Under 10m', hint: '1 bay' },
              { value: true, label: '10m or larger', hint: '2 bays' },
            ].map((opt) => {
              const active = largeVessel === opt.value
              return (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => setLargeVessel(opt.value)}
                  aria-pressed={active}
                  className={
                    active
                      ? 'rounded-xl border-2 border-accent bg-accent/10 px-3 py-3 text-center transition'
                      : 'rounded-xl border border-navy/15 bg-white px-3 py-3 text-center transition hover:border-navy/30'
                  }
                >
                  <span className="block text-sm font-semibold text-navy">{opt.label}</span>
                  <span className={active ? 'text-xs font-medium text-accent-dark' : 'text-xs text-navy/50'}>{opt.hint}</span>
                </button>
              )
            })}
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
