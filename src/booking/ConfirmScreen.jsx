import { useState } from 'react'
import { useCmsContent } from '../hooks/useCmsContent.js'
import { createBooking } from './api.js'

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// Step 3 — confirm. Shows the LIVE member rate + notices fetched from the CMS
// at runtime (falling back to content.js values passed in `fallback`), lists
// every selected day with a total, and gates the confirm button behind a
// required acknowledgement checkbox.
export default function ConfirmScreen({ member, selections, fallback, onBack, onSuccess }) {
  const { content } = useCmsContent({
    'Pricing - Work Bay - Member Booked Rate': fallback.rate,
    'Pricing - Work Bay - Unit': fallback.unit,
    'Booking - Notice - Charge': fallback.chargeNotice,
    'Booking - Notice - Cancellation': fallback.cancelNotice,
    'Contact - Office - Email': fallback.officeEmail,
  })

  const rate = content['Pricing - Work Bay - Member Booked Rate']
  const unit = content['Pricing - Work Bay - Unit']
  const chargeNotice = content['Booking - Notice - Charge']
  const cancelNotice = content['Booking - Notice - Cancellation']
  const officeEmail = content['Contact - Office - Email']

  const largeVessel = !!member.largeVessel
  // Group the flat slot list by date so large vessels (2 bays/day) read clearly.
  const byDay = selections.reduce((acc, s) => {
    ;(acc[s.slotDate] ||= []).push(s.berthName)
    return acc
  }, {})
  const days = Object.keys(byDay).sort()
  const dayCount = days.length
  // Pricing is per DAY at the member rate. Large-vessel cost treatment (one rate
  // vs two bays) is being confirmed with the office (Barry said single, Dan said
  // 2x), so we estimate on days and flag the office confirms. TODO: finalise it.
  const rateNum = parseFloat(String(rate).replace(/[^0-9.]/g, ''))
  const currency = (String(rate).match(/^[^\d]*/) || [''])[0] || ''
  const total = Number.isFinite(rateNum) ? `${currency}${(rateNum * dayCount).toFixed(0)}` : null

  const [ack, setAck] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setError('')
    setBusy(true)
    try {
      const res = await createBooking({
        fullName: member.fullName,
        membershipNumber: member.membershipNumber,
        acknowledged: ack,
        slots: selections.map((s) => ({ berthId: s.berthId, slotDate: s.slotDate, slotPeriod: s.period })),
      })
      if (res.ok) onSuccess(res.booking)
      else {
        setError(res.error || 'Could not complete the booking.')
        if (res.code === 'taken') setTimeout(onBack, 1800)
      }
    } catch {
      setError('Could not reach the booking service. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-navy/10 bg-white p-7 shadow-sm">
      <button onClick={onBack} className="mb-4 text-sm font-semibold text-accent hover:underline">
        ← Back to availability
      </button>

      <h2 className="text-xl font-semibold text-navy">Confirm your booking</h2>
      <p className="mt-1 text-sm text-navy/60">
        {dayCount} day{dayCount !== 1 ? 's' : ''} for {member.fullName}.
      </p>

      {largeVessel && (
        <p className="mt-3 rounded-lg bg-accent/10 px-4 py-2.5 text-sm text-accent-dark">
          Large vessel (10m+) — each day reserves <strong>2 work bays</strong> together.
        </p>
      )}

      {/* Selected days (grouped — large vessels list both bays under one day) */}
      <ul className="mt-5 max-h-56 divide-y divide-navy/5 overflow-y-auto rounded-xl bg-sand p-2 text-sm">
        {days.map((iso) => (
          <li key={iso} className="flex items-center justify-between px-2 py-2">
            <span className="font-semibold text-navy">{formatDate(iso)}</span>
            <span className="text-right text-navy/70">{byDay[iso].join(' + ')}</span>
          </li>
        ))}
      </ul>

      {/* Price */}
      <dl className="mt-4 space-y-1.5 rounded-xl border border-navy/10 p-4 text-sm">
        <div className="flex justify-between"><dt className="text-navy/60">Member rate</dt><dd className="font-semibold">{rate} {unit}</dd></div>
        <div className="flex justify-between"><dt className="text-navy/60">Days</dt><dd className="font-semibold">× {dayCount}</dd></div>
        {total && (
          <div className="flex justify-between border-t border-navy/10 pt-1.5 text-base">
            <dt className="font-semibold text-navy">Estimated total</dt>
            <dd className="font-bold text-accent-dark">{total}</dd>
          </div>
        )}
        <p className="pt-1 text-xs text-navy/45">
          {largeVessel
            ? 'Estimate shown per day. Large-vessel hire (2 bays) is confirmed and invoiced by the club office.'
            : 'Invoiced by the club office — no payment is taken online.'}
        </p>
      </dl>

      <div className="mt-5 space-y-3 text-sm text-navy/70">
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">{chargeNotice}</p>
        <p className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-800">No-shows will be charged the full amount.</p>
        <p className="rounded-lg bg-navy/5 px-4 py-3">
          {cancelNotice}{' '}
          <a href={`mailto:${officeEmail}`} className="font-semibold text-accent hover:underline">{officeEmail}</a>
        </p>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-navy">
        <input
          type="checkbox"
          checked={ack}
          onChange={(e) => setAck(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-navy/30 text-accent focus:ring-accent"
        />
        <span>I understand I will be charged and that changes/cancellations go through the office.</span>
      </label>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={!ack || busy}
        className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Confirming…' : `Confirm ${dayCount} day${dayCount !== 1 ? 's' : ''}`}
      </button>
    </div>
  )
}
