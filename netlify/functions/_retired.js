// The booking functions below were retired at cutover (2026-09-30): booking is
// served by the Pubd CMS from one shared database (src/booking/api.js).
//
// They refuse rather than keep working because they still pointed at the OLD
// database. A booking page left open from before cutover (or any script) could
// otherwise book there, invisible to the office and the new system, so the
// same bay could be taken twice. The refusal tells a stale page to reload.
//
// Rollback is unaffected: a Netlify rollback to the pre-cutover deploy
// restores that deploy's own working functions along with its page.
import { json } from './_supabase.js'

export const retired = async () =>
  json(410, {
    ok: false,
    code: 'moved',
    error: 'Our booking page has been updated. Please refresh this page and try again.',
  })
