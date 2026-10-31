// ── Show until ──
// A kit piece a client can time-box ("show until 1 Nov, 5pm") switches itself
// off at that moment, with no edit and no deploy. The time is NZ wall-clock
// time as text, "2026-11-01 17:00" (a bare date means the end of that day),
// because that is what a club means by "5pm Sunday", while a visitor's device
// can be in any timezone and NZ itself changes offset (NZST to NZDT). So the
// moment is formatted into NZ time and the two compared as text: the
// YYYY-MM-DD HH:mm shape sorts correctly. (First built for the boat club's
// Snapper promo, 2026-10-18.)
//
// A page is prerendered, so its first render must match the built HTML: start
// from the build time (the site's vite.config defines __BUILT_AT__), then check
// the visitor's clock once mounted. Part of the shared kit.

/** The moment the site was built, or null on a site that does not define it. */
// eslint-disable-next-line no-undef
export const builtAt = () => (typeof __BUILT_AT__ !== 'undefined' ? new Date(__BUILT_AT__) : null)

/** Whether something shown "until" this time is still showing at `at`.
 *  No time (or one that cannot be read) = always showing. */
export function showingUntil(until, at) {
  const end = typeof until === 'string' ? until.trim() : ''
  if (!end || !at) return true
  if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/.test(end)) return true
  try {
    const nz = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(at).replace(',', '')
    return nz < (end.length === 10 ? `${end} 23:59` : end)
  } catch {
    return true
  }
}
