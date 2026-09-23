#!/usr/bin/env node
/**
 * Load the club's membership list into `members`.
 *
 * ── Why this exists rather than a dashboard CSV import ──────────────────────
 *
 * The office will send a fresh list every few months, and 40% of members have
 * no email address on it. The booking flow collects those addresses as people
 * book, so by the time the next list arrives we hold emails the office does
 * not. A plain import would overwrite every one of them with a blank cell.
 *
 * So this MERGES. The rules, in order of how much damage getting them wrong
 * would do:
 *
 *   1. An email we already hold is NEVER replaced by a blank. Ever.
 *   2. Match on membership number. It is unique and always present (verified
 *      across 1,009 rows: no duplicates, none missing). Email is NOT unique —
 *      14 addresses are shared by couples — so matching on it would merge two
 *      people into one.
 *   3. Someone absent from the new list is marked inactive, not deleted. They
 *      stop being able to book; their booking history survives.
 *   4. A suspiciously large deactivation is REFUSED, not applied. A half-pasted
 *      spreadsheet should not lock out the club.
 *
 * Rule 4 is the wipe-guard, and it exists because we have been bitten by an
 * import that silently destroyed good data before (see the CMS scanner).
 *
 * ── Use ─────────────────────────────────────────────────────────────────────
 *
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     node scripts/import-members.mjs <file.csv> [--apply]
 *
 * Without --apply it prints exactly what WOULD change and writes nothing.
 * Always run it that way first.
 *
 * The CSV may be the office's own export (First Name, Last Name, Account
 * Number, Email Primary) or the table's own shape (full_name,
 * membership_number, email). Both are understood.
 */

const URL_ = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const [, , file, ...flags] = process.argv
const APPLY = flags.includes('--apply')

// A deactivation of more than this share of the roster is treated as a mistake.
const MAX_DEACTIVATE_RATIO = 0.2

if (!URL_ || !KEY) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
if (!file) { console.error('Usage: import-members.mjs <file.csv> [--apply]'); process.exit(1) }

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const api = (path, init) => fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init?.headers || {}) } })

/** Minimal CSV reader: quoted fields, escaped quotes, CRLF. */
function parseCsv(text) {
  const rows = []; let field = '', row = [], quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false }
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

function readMembers(text) {
  const rows = parseCsv(text).filter(r => r.length > 1)
  const header = rows[0].map(h => h.trim().toLowerCase())
  const at = (names) => names.map(n => header.indexOf(n)).find(i => i >= 0) ?? -1
  const iFirst = at(['first name', 'firstname'])
  const iLast = at(['last name', 'lastname', 'surname'])
  const iFull = at(['full_name', 'full name', 'name'])
  const iNum = at(['account number', 'membership_number', 'membership number', 'account'])
  const iMail = at(['email primary', 'email', 'email_primary'])
  if (iNum < 0) throw new Error('No membership/account number column found')

  const seen = new Set()
  const out = []
  for (const r of rows.slice(1)) {
    const num = (r[iNum] || '').trim()
    if (!num) continue
    const name = iFull >= 0
      ? (r[iFull] || '').trim()
      : [(r[iFirst] || '').trim(), (r[iLast] || '').trim()].filter(Boolean).join(' ')
    if (!name) continue
    if (seen.has(num)) continue          // first row wins; duplicates are an office typo
    seen.add(num)
    out.push({ membership_number: num, full_name: name.replace(/\s+/g, ' '), email: (iMail >= 0 ? (r[iMail] || '').trim() : '') || null })
  }
  return out
}

const main = async () => {
  const fs = await import('node:fs')
  const incoming = readMembers(fs.readFileSync(file, 'utf8'))
  console.log(`CSV: ${incoming.length} members, ${incoming.filter(m => !m.email).length} without an email`)

  // Existing roster, paged: PostgREST caps a response and a silent truncation
  // here would look like "everyone left the club".
  const existing = []
  for (let from = 0; ; from += 1000) {
    const res = await api('members?select=id,full_name,membership_number,email,active&order=membership_number', {
      headers: { Range: `${from}-${from + 999}` },
    })
    const page = await res.json()
    if (!Array.isArray(page)) throw new Error('Read failed: ' + JSON.stringify(page).slice(0, 200))
    existing.push(...page)
    if (page.length < 1000) break
  }
  console.log(`Table: ${existing.length} members, ${existing.filter(m => m.email).length} with an email`)

  const byNumber = new Map(existing.map(m => [String(m.membership_number).trim(), m]))
  const incomingNumbers = new Set(incoming.map(m => m.membership_number))

  const toInsert = [], toUpdate = [], keptEmails = []
  for (const m of incoming) {
    const cur = byNumber.get(m.membership_number)
    if (!cur) { toInsert.push(m); continue }

    const patch = {}
    if (cur.full_name !== m.full_name) patch.full_name = m.full_name
    // RULE 1. A blank in the office's export never erases an address we hold.
    if (m.email && m.email.toLowerCase() !== (cur.email || '').toLowerCase()) patch.email = m.email
    else if (!m.email && cur.email) keptEmails.push(cur)
    if (cur.active === false) patch.active = true   // rejoined
    if (Object.keys(patch).length) toUpdate.push({ id: cur.id, number: m.membership_number, patch })
  }

  // --no-deactivate: additive only. The right semantic for a FIRST load, where
  // there is no prior roster to reconcile against — and the thing that stops it
  // disabling the seeded test members, who are deliberately not on the office's
  // list and carry our own email so confirmations during testing never reach a
  // real member.
  const additiveOnly = flags.includes('--no-deactivate')
  const toDeactivate = additiveOnly
    ? []
    : existing.filter(m => m.active !== false && !incomingNumbers.has(String(m.membership_number).trim()))

  console.log(`\n  new members:            ${toInsert.length}`)
  console.log(`  updated:                ${toUpdate.length}`)
  console.log(`  emails KEPT (blank in the CSV, held here): ${keptEmails.length}`)
  console.log(`  to deactivate (absent from the CSV):       ${toDeactivate.length}${additiveOnly ? '  [--no-deactivate]' : ''}`)

  if (toUpdate.length) {
    console.log('\n  sample changes:')
    toUpdate.slice(0, 5).forEach(u => console.log(`    #${u.number}: ${JSON.stringify(u.patch)}`))
  }
  if (toDeactivate.length) {
    console.log('\n  sample deactivations:')
    toDeactivate.slice(0, 5).forEach(m => console.log(`    #${m.membership_number} ${m.full_name}`))
  }

  // RULE 4. The wipe-guard.
  const ratio = existing.length ? toDeactivate.length / existing.length : 0
  if (existing.length && ratio > MAX_DEACTIVATE_RATIO) {
    console.error(`\n✖ REFUSING: this would deactivate ${toDeactivate.length} of ${existing.length} members (${Math.round(ratio * 100)}%).`)
    console.error('  That is the shape of a partial export, not a membership change.')
    console.error('  Check the file is complete. Override deliberately with --force-deactivate.')
    if (!flags.includes('--force-deactivate')) process.exit(2)
  }

  if (!APPLY) { console.log('\nDRY RUN — nothing written. Re-run with --apply.'); return }

  for (let i = 0; i < toInsert.length; i += 500) {
    const res = await api('members', { method: 'POST', body: JSON.stringify(toInsert.slice(i, i + 500)) })
    if (!res.ok) throw new Error('Insert failed: ' + (await res.text()).slice(0, 200))
  }
  for (const u of toUpdate) {
    const res = await api(`members?id=eq.${u.id}`, { method: 'PATCH', body: JSON.stringify(u.patch) })
    if (!res.ok) console.error('  update failed', u.number, (await res.text()).slice(0, 120))
  }
  for (const m of toDeactivate) {
    await api(`members?id=eq.${m.id}`, { method: 'PATCH', body: JSON.stringify({ active: false }) })
  }
  console.log('\n✓ applied.')
}

main().catch(e => { console.error(e.message); process.exit(1) })
