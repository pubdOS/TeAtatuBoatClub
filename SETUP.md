# Booking System — Setup Checklist

Work down this in order. The content site is already live; this turns on the
members-only `/booking` flow (Supabase + Resend + Netlify Functions).

**Demo-safe rule:** until you're ready to go live, point `EMAIL_OFFICE` and
`EMAIL_MANAGER` at **your own inbox** so nothing reaches the club.

---

## 1. Supabase (database)

- [ ] Create a project at **supabase.com** → New project → region **Sydney** (closest to NZ). Save the database password somewhere.
- [ ] **SQL Editor** → New query → paste all of **`supabase/schema.sql`** → Run.
      (Creates `members`, `berths`, `bookings`, the anti-double-booking unique index, and seeds the 4 work bays.)
- [ ] Load some members:
  - **Testing now:** SQL Editor → paste **`supabase/seed-test-members.sql`** (edit the emails to yours) → Run.
  - **Go-live:** Table Editor → `members` → Import data from CSV (Dan's list: columns `full_name, membership_number, email`).
- [ ] **Project Settings → API** → copy these two (you'll paste them into Netlify in step 3):
  - `Project URL`  → `SUPABASE_URL`
  - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`  ⚠️ secret — server-side only, never in the frontend.

## 2. Resend (sends the confirmation emails)

- [ ] Create an account at **resend.com** (one account works for all your client sites).
- [ ] **Domains → Add Domain** → enter the **subdomain** `send.teatatuboatclub.co.nz`.
- [ ] Add the DNS records Resend shows you (MX + SPF TXT + DKIM) at wherever **`teatatuboatclub.co.nz` DNS is managed**.
      These live on the `send.` subdomain only — they do **not** touch the club's Microsoft 365 email on the root domain.
- [ ] Wait for **Verified** (minutes–few hours).
- [ ] **API Keys → Create** → copy it → `RESEND_API_KEY`.
- [ ] From address → `EMAIL_FROM` = `Te Atatu Boating Club <bookings@send.teatatuboatclub.co.nz>`

  > No DNS access yet? Start in **test mode**: set `EMAIL_FROM="Te Atatu Boating Club <onboarding@resend.dev>"` to test the flow to your own inbox, then switch to the subdomain before go-live.

## 3. Netlify (environment variables)

**Site config → Environment variables** → add all of these (see `.env.example`):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | from Supabase step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase step 1 (secret) |
| `RESEND_API_KEY` | from Resend step 2 |
| `EMAIL_FROM` | `Te Atatu Boating Club <bookings@send.teatatuboatclub.co.nz>` |
| `EMAIL_OFFICE` | **your inbox** for now → `office@teatatuboatclub.co.nz` at go-live |
| `EMAIL_MANAGER` | **your inbox** for now → real `manager@` at go-live |
| `ADMIN_PASSWORD` | pick a strong password (for the `/admin` page) |
| `VITE_CMS_API` | your CMS content endpoint for this client |

- [ ] All added → **Deploys → Trigger deploy → Deploy site** (functions only pick up env vars on a fresh deploy).

## 4. Test end-to-end

- [ ] Go to `/booking` on the live site. Enter a **test member** name + number → should pass the gate.
- [ ] Enter a wrong number → should be rejected.
- [ ] Pick a free bay/day → confirm screen shows the **$25 rate**, the charge + cancellation notices, and the **acknowledgement checkbox** (button disabled until ticked).
- [ ] Confirm → success screen with a reference, and emails arrive at your test inbox (office + manager + member).
- [ ] Try booking the **same bay/day twice** → second attempt rejected ("just taken").
- [ ] Visit `/admin` → enter `ADMIN_PASSWORD` → see the booking → cancel it (frees the slot).

## 5. Go-live switch (after the demo + Dan sign-off)

- [ ] Load the **real membership CSV** into `members` (with real emails).
- [ ] Set `EMAIL_OFFICE` / `EMAIL_MANAGER` to the **real club addresses** → redeploy.
- [ ] Confirm Resend subdomain is **Verified** (not test mode).
- [ ] Replace the placeholder **work-bay names** (in `supabase/schema.sql` seed + `content.js`) with the real ones — keep IDs 1–4.

---

## Still need from Dan
Committee/officer names · real work-bay names · `manager@` address · venue-hire
pricing · event details · confirm slot = full day · per-member quota? · Skedda
cutover plan. (See `README.md` for the full list.)
