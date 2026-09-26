// Which work bays sit behind which (Dan, 2026-09-26): Bay 2 is behind Bay 1 and
// Bay 3 is behind Bay 4, so with 1 and 4 occupied a boat can barely get in or
// out of 2 and 3. The club's rule: the BACK bays fill first. On any day, a front
// bay can only be booked once the bay behind it is taken, or is being booked in
// the same go (a large boat taking the pair, or someone choosing both).
//
// Shared by the server check (create-booking) and the booking grid, so the two
// can never disagree. Keyed by berth id, which matches the bay number
// (supabase/schema.sql).
export const BEHIND = { 1: 2, 4: 3 }

/**
 * Is this front bay bookable on this day?
 * @param {number} berthId
 * @param {string} date  YYYY-MM-DD
 * @param {(berthId:number, date:string)=>boolean} occupied  taken already, or chosen in this booking
 */
export function frontBayOpen(berthId, date, occupied) {
  const back = BEHIND[berthId]
  return back == null || occupied(back, date)
}

/**
 * The first slot in a booking that breaks the rule, or null.
 * @param {{berthId:number, slotDate:string}[]} slots  the booking being made
 * @param {(berthId:number, date:string)=>boolean} takenAlready  existing bookings
 */
export function backBayFirstViolation(slots, takenAlready) {
  const inBooking = new Set(slots.map((s) => `${s.berthId}|${s.slotDate}`))
  const occupied = (b, d) => takenAlready(b, d) || inBooking.has(`${b}|${d}`)
  for (const s of slots) {
    if (!frontBayOpen(s.berthId, s.slotDate, occupied)) return { front: s.berthId, back: BEHIND[s.berthId], date: s.slotDate }
  }
  return null
}
