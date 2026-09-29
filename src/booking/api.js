// Thin wrappers around the booking API, which the Pubd CMS serves for every
// booking client from one shared database (sitemog-toolkit/BOOKING_SHARED_DB_PLAN.md).
// This site holds no database key. Callers handle the !ok / network-error cases.
//
// VITE_BOOKING_API overrides the base for local testing against `next dev`
// (e.g. http://localhost:3000/api/booking/teatatu); that origin must also be in
// the club's allowed_origins.
//
// The old Netlify functions stay deployed until the cutover has settled, so a
// Netlify rollback to the previous deploy is a complete rollback.
const BASE = import.meta.env.VITE_BOOKING_API || 'https://cms.pubd.io/api/booking/teatatu'

async function post(name, body) {
  const res = await fetch(`${BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  return res.json()
}

export function validateMember(fullName, membershipNumber) {
  return post('validate-member', { fullName, membershipNumber })
}

export async function getAvailability() {
  const res = await fetch(`${BASE}/availability`)
  return res.json()
}

export function createBooking(payload) {
  return post('book', payload)
}

// The office's /admin page (shared password), served by the CMS so it reads
// the same bookings as the CMS Bookings tab.
export function adminBookings(password) {
  return post('admin', { password, action: 'list' })
}

export function adminCancel(password, bookingId) {
  return post('admin', { password, action: 'cancel', bookingId })
}
