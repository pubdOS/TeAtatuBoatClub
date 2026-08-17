import { useEffect, useState } from 'react'
import { getAvailability } from './api.js'

const PERIOD = 'day' // current slot granularity (see schema.sql / Part C #1)
const MAX_DAYS = 5   // a member can hold up to 5 distinct days in one booking

function formatDay(iso) {
  const d = new Date(`${iso}T00:00:00`)
  return {
    weekday: d.toLocaleDateString('en-NZ', { weekday: 'short' }),
    day: d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' }),
  }
}

// Step 2 — visual availability: rows = work bays, columns = next 14 days.
// Tap any number of free cells to select them, then continue to confirm.
export default function AvailabilityGrid({ member, onSelect }) {
  const [state, setState] = useState({ status: 'loading' })
  const [selected, setSelected] = useState({}) // key `${berthId}|${iso}` -> selection object
  const [limitHit, setLimitHit] = useState(false) // true when a 6th day was blocked

  useEffect(() => {
    let active = true
    getAvailability()
      .then((data) => {
        if (!active) return
        if (data.ok) setState({ status: 'ready', ...data })
        else setState({ status: 'error', error: data.error || 'Could not load availability.' })
      })
      .catch(() => active && setState({ status: 'error', error: 'Could not reach the booking service.' }))
    return () => {
      active = false
    }
  }, [])

  if (state.status === 'loading') {
    return <p className="py-10 text-center text-navy/50">Loading availability…</p>
  }
  if (state.status === 'error') {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700">
        <p>{state.error}</p>
        <button onClick={() => window.location.reload()} className="btn-outline mt-4">
          Retry
        </button>
      </div>
    )
  }

  const { days, berths, taken } = state

  // Large vessels (≥10m) need an adjacent PAIR of bays for the day — either
  // 1 & 2 or 3 & 4. A day is available if at least one full pair is free; we
  // assign the first free pair (prefer 1 & 2). For them we select whole DAYS;
  // everyone else books per-bay.
  const largeVessel = !!member.largeVessel
  const orderedBerths = [...berths].sort((a, b) => a.id - b.id)
  const [bay1, bay2, bay3, bay4] = orderedBerths
  const bayFree = (bay, iso) => !!bay && !taken[`${bay.id}|${iso}|${PERIOD}`]
  // The free pair assigned to a large vessel for this day, or null if none.
  const pairForDay = (iso) => {
    if (bayFree(bay1, iso) && bayFree(bay2, iso)) return [bay1, bay2]
    if (bayFree(bay3, iso) && bayFree(bay4, iso)) return [bay3, bay4]
    return null
  }
  const dayTaken = (iso) => pairForDay(iso) === null

  // Flatten the current selection into the slot list the API expects. For large
  // vessels each selected day yields two slots — the assigned free pair.
  const selectedList = largeVessel
    ? Object.values(selected)
        .sort((a, b) => a.slotDate.localeCompare(b.slotDate))
        .flatMap((s) => {
          const pair = pairForDay(s.slotDate)
          return pair
            ? pair.map((bay) => ({ berthId: bay.id, berthName: bay.name, slotDate: s.slotDate, period: PERIOD }))
            : []
        })
    : Object.values(selected).sort((a, b) => a.slotDate.localeCompare(b.slotDate))
  const dayCount = largeVessel ? Object.keys(selected).length : selectedList.length

  const toggle = (berth, iso) => {
    const key = `${berth.id}|${iso}`
    if (!selected[key]) {
      const dates = new Set(Object.values(selected).map((s) => s.slotDate))
      if (!dates.has(iso) && dates.size >= MAX_DAYS) { setLimitHit(true); return }
    }
    setLimitHit(false)
    setSelected((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = { berthId: berth.id, berthName: berth.name, slotDate: iso, period: PERIOD }
      return next
    })
  }

  const toggleDay = (iso) => {
    if (!selected[iso] && Object.keys(selected).length >= MAX_DAYS) { setLimitHit(true); return }
    setLimitHit(false)
    setSelected((prev) => {
      const next = { ...prev }
      if (next[iso]) delete next[iso]
      else next[iso] = { slotDate: iso }
      return next
    })
  }

  // ── Large-vessel view: pick whole days; each books bays 1 & 2 together ──
  if (largeVessel) {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-navy/70">
            Signed in as <strong>{member.fullName}</strong>. Your vessel (10m+) uses{' '}
            <strong>a pair of bays</strong> (1 &amp; 2, or 3 &amp; 4) together — tap the days you need (up to {MAX_DAYS}).
          </p>
          <div className="flex items-center gap-4 text-xs text-navy/60">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-accent/20 ring-1 ring-accent/40" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gold ring-1 ring-gold-dark" /> Selected</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-navy/10" /> Unavailable</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
          {days.map((iso) => {
            const f = formatDay(iso)
            const isTaken = dayTaken(iso)
            const isSelected = !!selected[iso]
            const pair = isTaken ? null : pairForDay(iso)
            const pairLabel = pair ? `Bays ${pair[0].id} & ${pair[1].id}` : ''
            return (
              <button
                key={iso}
                onClick={() => !isTaken && toggleDay(iso)}
                disabled={isTaken}
                aria-pressed={isSelected}
                className={
                  isTaken
                    ? 'cursor-not-allowed rounded-xl bg-navy/5 px-2 py-3 text-center text-navy/35'
                    : isSelected
                      ? 'rounded-xl bg-gold px-2 py-3 text-center font-bold text-navy ring-1 ring-inset ring-gold-dark transition'
                      : 'rounded-xl bg-accent/15 px-2 py-3 text-center font-semibold text-accent-dark ring-1 ring-inset ring-accent/30 transition hover:bg-accent hover:text-white'
                }
              >
                <div className="text-[11px] uppercase opacity-80">{f.weekday}</div>
                <div className="text-sm">{f.day}</div>
                <div className="mt-1 text-[10px] font-medium">{isTaken ? 'Unavailable' : isSelected ? '✓ Selected' : pairLabel}</div>
              </button>
            )
          })}
        </div>

        <div className="sticky bottom-4 z-20 mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy/10 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
            {limitHit && <p className="w-full text-xs font-semibold text-gold-dark">That’s the {MAX_DAYS}-day limit — deselect a day to choose another.</p>}
            <p className="text-sm text-navy/70">
              {dayCount === 0 ? (
                'No days selected yet.'
              ) : (
                <>
                  <strong className="text-navy">{dayCount}</strong> day{dayCount !== 1 ? 's' : ''} selected
                  <span className="ml-2 text-navy/45">a pair of bays each day</span>
                </>
              )}
            </p>
            <button
              onClick={() => onSelect(selectedList)}
              disabled={dayCount === 0}
              className="btn-primary px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue{dayCount > 0 ? ` (${dayCount})` : ''}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const count = selectedList.length

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy/70">
          Signed in as <strong>{member.fullName}</strong>. Tap any free days to select — up to {MAX_DAYS} days per booking.
        </p>
        <div className="flex items-center gap-4 text-xs text-navy/60">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-accent/20 ring-1 ring-accent/40" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gold ring-1 ring-gold-dark" /> Selected</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-navy/10" /> Taken</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-navy/10">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-sand px-3 py-3 text-left font-semibold text-navy">Bay</th>
              {days.map((iso) => {
                const f = formatDay(iso)
                return (
                  <th key={iso} className="bg-sand px-2 py-2 text-center font-medium text-navy/70">
                    <div className="text-[11px] uppercase">{f.weekday}</div>
                    <div className="text-xs">{f.day}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {berths.map((berth) => (
              <tr key={berth.id} className="border-t border-navy/5">
                <th className="sticky left-0 z-10 bg-white px-3 py-3 text-left font-semibold text-navy">
                  {berth.name}
                </th>
                {days.map((iso) => {
                  const isTaken = taken[`${berth.id}|${iso}|${PERIOD}`]
                  const isSelected = !!selected[`${berth.id}|${iso}`]
                  return (
                    <td key={iso} className="px-1.5 py-1.5 text-center">
                      {isTaken ? (
                        <span className="block rounded-md bg-navy/10 px-2 py-2 text-[11px] text-navy/40">Taken</span>
                      ) : (
                        <button
                          onClick={() => toggle(berth, iso)}
                          aria-pressed={isSelected}
                          className={
                            isSelected
                              ? 'block w-full rounded-md bg-gold px-2 py-2 text-[11px] font-bold text-navy ring-1 ring-inset ring-gold-dark transition'
                              : 'block w-full rounded-md bg-accent/15 px-2 py-2 text-[11px] font-semibold text-accent-dark ring-1 ring-inset ring-accent/30 transition hover:bg-accent hover:text-white'
                          }
                        >
                          {isSelected ? '✓' : 'Book'}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selection bar */}
      <div className="sticky bottom-4 z-20 mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy/10 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          {limitHit && <p className="w-full text-xs font-semibold text-gold-dark">That’s the {MAX_DAYS}-day limit — deselect a day to choose another.</p>}
          <p className="text-sm text-navy/70">
            {count === 0 ? (
              'No days selected yet.'
            ) : (
              <>
                <strong className="text-navy">{count}</strong> day{count !== 1 ? 's' : ''} selected
                <span className="ml-2 text-navy/45">
                  {selectedList.slice(0, 3).map((s) => `${s.berthName.replace('Work Bay', 'Bay')} ${s.slotDate.slice(5)}`).join(', ')}
                  {count > 3 ? ` +${count - 3} more` : ''}
                </span>
              </>
            )}
          </p>
          <button
            onClick={() => onSelect(selectedList)}
            disabled={count === 0}
            className="btn-primary px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue{count > 0 ? ` (${count})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
