// Shared helpers for the booking Netlify Functions.
// Uses the Supabase SERVICE ROLE key — server-side only, never sent to the browser.
import { createClient } from '@supabase/supabase-js'

// How far AHEAD a member can book (committee rule, via Barry 2026-08: 5 days).
// Separate from MAX_DAYS in create-booking.js (how many days per single booking).
export const BOOKING_WINDOW_DAYS = 5

let _client
export function supabase() {
  if (_client) return _client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars are not configured')
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

// JSON HTTP response helper for the classic Netlify handler signature.
export function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export function parseBody(event) {
  try {
    return JSON.parse(event.body || '{}')
  } catch {
    return {}
  }
}

// ─── Date window (computed in NZ local time) ─────────────────────────────
// Bookings are per calendar date in Pacific/Auckland. Returns 'YYYY-MM-DD'.
export function nzToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return parts // en-CA gives YYYY-MM-DD
}

export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// True if slot_date is within [today, today + WINDOW] and not in the past.
export function isWithinWindow(slotDate) {
  const today = nzToday()
  const max = addDays(today, BOOKING_WINDOW_DAYS)
  return slotDate >= today && slotDate <= max
}

// ─── Member validation (server-side source of truth) ─────────────────────
// Matches a current member on lower(full_name) + exact membership_number.
// Returns the member row or null.
export async function findActiveMember(fullName, membershipNumber) {
  const name = String(fullName || '').trim()
  const number = String(membershipNumber || '').trim()
  if (!name || !number) return null
  const { data, error } = await supabase()
    .from('members')
    .select('id, full_name, membership_number, email')
    .eq('active', true)
    .ilike('full_name', name) // case-insensitive exact (no wildcards passed)
    .eq('membership_number', number)
    .limit(1)
  if (error) throw error
  return data && data[0] ? data[0] : null
}
