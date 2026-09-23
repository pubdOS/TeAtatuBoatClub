// POST { fullName, membershipNumber } → { ok, member? }
// Confirms the person is a current member before showing the booking flow.
// NOTE: this is a convenience gate only — create-booking re-validates server-side.
import { json, parseBody, findActiveMember } from './_supabase.js'

/** a••••@gmail.com — enough to recognise, not enough to learn. */
function maskEmail(address) {
  const [user, domain] = String(address).split('@')
  if (!domain) return null
  const head = user.slice(0, 1)
  return `${head}${'\u2022'.repeat(Math.max(3, Math.min(user.length - 1, 6)))}@${domain}`
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' })
  try {
    const { fullName, membershipNumber } = parseBody(event)
    const member = await findActiveMember(fullName, membershipNumber)
    if (!member) {
      return json(200, {
        ok: false,
        error: "We couldn't match those details. Please check your membership number, or contact the office.",
      })
    }
    // Return only what the UI needs — never the address itself. Name plus
    // membership number is a weak credential (both are knowable), so handing
    // back a member's email to anyone who can guess them would be a real leak.
    //
    // A masked hint is enough for the job: it lets someone recognise their own
    // address and confirm it, without disclosing it to someone who does not
    // already know it.
    return json(200, {
      ok: true,
      member: {
        full_name: member.full_name,
        membership_number: member.membership_number,
        hasEmail: Boolean(member.email),
        emailHint: member.email ? maskEmail(member.email) : null,
      },
    })
  } catch (e) {
    console.error('validate-member error', e)
    return json(500, { ok: false, error: 'Server error. Please try again or contact the office.' })
  }
}
