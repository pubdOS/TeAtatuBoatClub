// POST { fullName, membershipNumber, acknowledged,
//        slots: [{ berthId, slotDate, slotPeriod? }] }
//   (also accepts a single { berthId, slotDate } for backward-compat)
//   → { ok, booking: { count, items: [{bay, date}], references } } | { ok:false, error, code? }
//
// Server-side guarantees (never trust the client):
//   • member is re-validated against the DB
//   • the acknowledgement checkbox must be true
//   • every slot_date must be within [today, today+5d] NZ time (no past slots)
//   • a single multi-row INSERT is atomic — if ANY slot is already taken the
//     whole batch rolls back (unique index → 23505), so you never get a
//     half-booked range.
import { Resend } from 'resend'
import { json, parseBody, supabase, findActiveMember, isWithinWindow } from './_supabase.js'

const VALID_BERTHS = new Set([1, 2, 3, 4])
// BOOKING_WINDOW_DAYS (5) controls how far AHEAD you can book; MAX_DAYS caps how
// many distinct days a member can hold in a single booking. A large vessel (≥10m)
// books 2 bays per day, so 5 days = up to 10 bay-slots; a regular member could
// pick up to 4 bays × 5 days = 20. MAX_SLOTS is just a defensive upper bound.
const MAX_DAYS = 5
const MAX_SLOTS = 20

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' })
  try {
    const body = parseBody(event)
    const fullName = String(body.fullName || '').trim()
    const membershipNumber = String(body.membershipNumber || '').trim()
    const acknowledged = body.acknowledged === true

    // Accept an array of slots, or a single slot (legacy single-day payload).
    let slots = Array.isArray(body.slots) ? body.slots : null
    if (!slots && body.berthId != null) {
      slots = [{ berthId: body.berthId, slotDate: body.slotDate, slotPeriod: body.slotPeriod }]
    }

    if (!acknowledged) {
      return json(400, { ok: false, error: 'You must acknowledge the charge and cancellation terms to book.' })
    }
    if (!slots || slots.length === 0) {
      return json(400, { ok: false, error: 'Please choose at least one day.' })
    }
    if (slots.length > MAX_SLOTS) {
      return json(400, { ok: false, error: `You can book up to ${MAX_DAYS} days at once.` })
    }

    // Validate + normalise each slot, de-duplicating identical ones.
    const seen = new Set()
    const norm = []
    for (const s of slots) {
      const berthId = Number(s.berthId)
      const slotDate = String(s.slotDate || '').trim()
      const slotPeriod = String(s.slotPeriod || 'day').trim()
      if (!VALID_BERTHS.has(berthId)) {
        return json(400, { ok: false, error: 'That work bay does not exist.' })
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(slotDate) || !isWithinWindow(slotDate)) {
        return json(400, { ok: false, error: 'Please choose days within the next 5 days.' })
      }
      const key = `${berthId}|${slotDate}|${slotPeriod}`
      if (seen.has(key)) continue
      seen.add(key)
      norm.push({ berthId, slotDate, slotPeriod })
    }

    // ── Cap distinct days per booking (the window controls how far ahead) ──
    const distinctDays = new Set(norm.map((s) => s.slotDate)).size
    if (distinctDays > MAX_DAYS) {
      return json(400, { ok: false, error: `You can book up to ${MAX_DAYS} days at once.` })
    }

    // ── Re-validate the member server-side ──
    const member = await findActiveMember(fullName, membershipNumber)
    if (!member) {
      return json(403, { ok: false, error: "We couldn't confirm your membership. Please contact the office." })
    }

    // ── Atomic multi-row insert (unique index rejects any double-booking) ──
    const sb = supabase()
    const rows = norm.map((s) => ({
      berth_id: s.berthId,
      slot_date: s.slotDate,
      slot_period: s.slotPeriod,
      member_id: member.id,
      member_name: member.full_name,
      membership_number: member.membership_number,
      status: 'confirmed',
    }))

    const { data, error } = await sb.from('bookings').insert(rows).select('id, berth_id, slot_date, slot_period')
    if (error) {
      if (error.code === '23505') {
        return json(409, { ok: false, code: 'taken', error: 'One or more of those days was just taken — please pick again.' })
      }
      throw error
    }

    // Bay names for display + emails.
    const { data: berths } = await sb.from('berths').select('id, name')
    const nameById = Object.fromEntries((berths || []).map((b) => [b.id, b.name]))
    const items = data
      .map((b) => ({ bay: nameById[b.berth_id] || `Work Bay ${b.berth_id}`, date: b.slot_date }))
      .sort((a, b) => a.date.localeCompare(b.date))
    const references = data.map((d) => d.id)

    // ── Notifications (best-effort — booking already succeeded) ──
    await sendEmails({ items, member, references }).catch((e) =>
      console.error('email send failed (booking still confirmed)', e),
    )

    return json(200, { ok: true, booking: { count: data.length, items, references } })
  } catch (e) {
    console.error('create-booking error', e)
    return json(500, { ok: false, error: 'Server error. Your booking was not made — please try again.' })
  }
}

async function sendEmails({ items, member, references }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping emails')
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.EMAIL_FROM || 'Te Atatū Boating Club <onboarding@resend.dev>'
  const office = process.env.EMAIL_OFFICE
  const manager = process.env.EMAIL_MANAGER

  // Count distinct DAYS, not bay-slots — a large vessel books 2 bays on one day.
  const dayCount = new Set(items.map((i) => i.date)).size
  const list = items.map((i) => `<li><strong>${i.bay}</strong> — ${i.date}</li>`).join('')
  const summary = `
    <table style="border-collapse:collapse;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0;color:#667">Member</td><td>${member.full_name} (#${member.membership_number})</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#667">Days booked</td><td>${dayCount}</td></tr>
    </table>
    <ul style="font-size:14px;margin-top:8px;padding-left:18px">${list}</ul>
    <p style="color:#667;font-size:12px">Reference(s): ${references.join(', ')}</p>`

  const subjectDays = dayCount === 1 ? `${items[0].bay}, ${items[0].date}` : `${dayCount} days`

  const officeRecipients = [office, manager].filter(Boolean)
  if (officeRecipients.length) {
    await resend.emails.send({
      from,
      to: officeRecipients,
      subject: `New work-bay booking — ${subjectDays}`,
      html: `<h2>New work-bay booking</h2>${summary}<p style="color:#667;font-size:12px">Sent automatically by the booking system.</p>`,
    })
  }

  if (member.email) {
    await resend.emails.send({
      from,
      to: member.email,
      subject: `Your work-bay booking is confirmed — ${subjectDays}`,
      html: `
        <h2>Booking confirmed</h2>
        <p>Thanks ${member.full_name}, your work-bay booking is confirmed:</p>
        ${summary}
        <p style="margin-top:16px">${process.env.BOOKING_NOTICE_CHARGE || 'The club will invoice you for work-bay hire at the member day rate. No payment is taken online.'}</p>
        <p>${process.env.BOOKING_NOTICE_CANCELLATION || 'Changes and cancellations must be made by emailing the office.'}</p>`,
    })
  }
}
