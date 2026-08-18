# Te Atatu Boating Club — Website + Work-Bay Booking System

One repo, **two cleanly separated systems**:

1. **Content site** — Vite + React Router v6 + Tailwind, wired to the custom CMS via
   `data-cms*` attributes + `content.js`. The office edits all copy/images/pricing here.
2. **Booking system** — a members-only serverless app at `/booking` for the four work
   bays (replaces Skedda). Netlify Functions + Supabase + Resend email. **Carries zero
   `data-cms*` attributes** so the CMS never tries to manage per-booking data.

---

## Quick start (local)

```bash
npm install
npm run dev          # content site only (booking functions NOT served)
# — or, to run the booking backend locally too —
npm i -g netlify-cli
netlify dev          # serves the site + /.netlify/functions/* with env from .env
```

Copy `.env.example` → `.env` and fill in values to exercise the booking flow locally.

Build: `npm run build` → outputs to `dist/`.

---

## How the two systems meet (three bridge points)

| Bridge | Mechanism |
| --- | --- |
| **Pricing** | Booking confirm screen fetches `Pricing - Work Bay - Member Booked Rate` + `Unit` live from the CMS API (`VITE_CMS_API`), falling back to `content.js`. |
| **Notice wording + office email** | Static `data-cms` fields (`Booking - Notice - Charge/Cancellation`, `Contact - Office - Email`) edited in the CMS, read at runtime by the confirm screen. |
| **Bay names** | CMS-editable display text on the Facilities page; booking logic keys off the fixed Supabase `berths.id` (1–4), never the editable name. |

**Golden rule:** if a value changes per booking or per user, it is NOT a CMS field.

---

## Booking system setup (when going live)

### 1. Supabase
- Create a project. In the SQL editor, run `supabase/schema.sql` (tables, the critical
  `uniq_active_slot` unique index, and the four seeded bays).
- Load the membership list into the `members` table (Table editor → Import CSV, columns
  `full_name, membership_number, email`). See the note at the bottom of `schema.sql`.
- Copy the **service role** key + project URL into Netlify env vars (below). The service
  role key bypasses RLS and must **never** appear in the frontend bundle.

### 2. Resend (transactional email)
- Create a Resend account and **verify the club's sending domain** so booking emails are
  delivered reliably (the `EMAIL_FROM` address must be on a verified domain).
- Put the API key + addresses in Netlify env vars.

### 3. Netlify environment variables
Set these in **Site settings → Environment variables** (see `.env.example`):

| Var | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | DB access (server-side only) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Sending booking emails |
| `EMAIL_OFFICE`, `EMAIL_MANAGER` | Notification recipients |
| `ADMIN_PASSWORD` | Gate for the `/admin` bookings view |
| `VITE_CMS_API` | Public CMS content endpoint (read at runtime for live pricing/notices) |

### Netlify Functions
- `validate-member` — checks name + membership number against active members.
- `get-availability` — returns confirmed bookings in the next 14 days for the grid.
- `create-booking` — **re-validates the member**, enforces the 14-day/no-past window,
  inserts atomically (the unique index rejects double-bookings → error `23505`), then
  emails office@, manager@, and the member (if an email is on file).
- `admin-bookings` / `admin-cancel` — password-gated office list + cancel (frees the slot).

### Office view
`/admin` (not linked in the nav) — enter `ADMIN_PASSWORD` to see upcoming bookings and
cancel them. The office also gets an email on every booking, and can read the Supabase
`bookings` table directly.

---

## CMS notes
- `content.js` lives at the repo root and is the only content source the scanner reads.
- All imports use `import c from '...content.js'` (the scanner requires the variable `c`).
- Pricing on the Pricing page uses **static** `data-cms` fields (stable keys) so the
  booking flow can fetch a specific rate — never model pricing as a repeater.
- Site images go in `public/images/` (paths start `/images/`). Placeholders are marked
  `TODO` in `content.js` — drop in real assets.

---

## ⚠️ Open items to confirm with Dan (before go-live)

These are stubbed with sensible defaults — search the code for `TODO` to find them.

1. **Slot granularity** — currently **full day** (`slot_period = 'day'`), matching the
   site's "rates apply for part or full day". Switching to AM/PM later is a small change
   (the model is already keyed on `slot_period`). Confirm full-day is right.
2. **Real work-bay names/descriptions** — seeded as "Work Bay 1–4" in `schema.sql` and
   `content.js`. IDs 1–4 must stay stable.
3. **`manager@` address** — not published on the site; currently defaults to office@.
4. **Membership CSV** — need the export from Skedda/the office, **including emails** (for
   member confirmation messages).
5. **Pricing structure** — modelled as a flat member rate ($25 booked / $50 unbooked /
   $60 non-member). If it becomes per-bay or tiered, add one stable key per rate.
6. **Notice wording** — exact charge + cancellation text the club wants members to agree
   to (editable in the CMS, defaults in `content.js`).
7. **Resend from-domain** — verify the club's domain in Resend.
8. **Per-member quota** — not yet enforced (Skedda-style "max N active bookings"). Add if
   wanted.
9. **Auth strength** — name + membership number per brief (re-validated server-side). An
   optional phase-2 hardening is an email magic-link.
10. **Skedda migration** — decide on a clean cutover date or migrate existing future
    bookings.
11. **Brand colours / logo** — placeholder maritime palette in `tailwind.config.js`;
    replace `public/images/logo.png` with the real logo.
12. **Contact form** — currently a `mailto:` fallback; wire to Netlify Forms or a function
    if a stored enquiry inbox is wanted.
