# TeAtatuBoatClub — working context
_Last wrapped: 2026-08-25 · LIVE on teatatuboatclub.co.nz · CMS-wired · Pro_

## What this is
Te Atatū Boating Club: a ~750-family social + boating club. 12 pages, plus a **bespoke
work-bay booking module** (Netlify Functions + its own Supabase project) that is NOT part
of the CMS. Contacts: **Dan** (manager, the one who emails changes) and **Barry Hart**
(Commodore since the 2026 AGM). Committee-run, so the people change annually.

## Current state
- Live and healthy. Committee, rules and facilities copy all current as of 2026-08-25.
- **Booking is BUILT but gated off**: `content.js booking_live: false`. The only thing
  standing between it and going live is the **members CSV from the office** (name +
  membership number + email) loaded into the booking Supabase.
- In flight: nothing. `committee-photos-and-links` was merged 2026-08-25.
- **Bridge is one version behind.** The live-editor `goTo` fix (section arrows) is in
  `sitemog-starter` but not here yet — it rides this site's next real deploy, deliberately
  (see BACKLOG "Bridge fix awaiting a fleet rollout").

## Decisions & why
- **Committee photos: the slot is wired NOW, before the photos exist.** Every member carries
  an empty `image` defaulting to a transparent pixel layered over their initial, so the cards
  look unchanged until someone uploads. Adding the field later would have been a structural
  change plus a re-scan, i.e. dev work triggered by the client sending photos — exactly what
  the CMS exists to avoid.
- **An empty email renders as a `<span>`, not a link.** Only 2 of the 10 committee have a club
  address (Dan's explicit call). The element must stay in the DOM either way or the field is
  uneditable forever, so the fix is the element type, not its presence.
- **Booking limits (Dan, 2026-08):** $25/day single berth, **$50/day** double (large vessel),
  $150 fine for using a berth unbooked, **$150 fine for a vessel left in the loading area over
  3 hours**, non-member $60. Max **10 booked days** held at once, no run longer than **5
  consecutive** days, 90-day advance window. All enforced server-side.
- **Bays are numbered from the RAMP end** (Bay 1 = ramp/south → Bay 4 = bridge/north). This is
  the OPPOSITE of what Barry said; Dan corrected it. Do not "fix" it back.

## Gotchas / lessons
- **Booking notifications have NOTHING to do with the CMS.** `create-booking.js` emails
  `process.env.EMAIL_OFFICE` + `EMAIL_MANAGER`, which are **Netlify env vars on this site**.
  Adding someone in the CMS People panel does not give them booking emails, and changing the
  env var needs a redeploy to reach the function.
- **Values were hand-edited in `content.js` on 2026-08-25** (committee + the loading-area
  fine), which normally belongs to the CMS. It rode the same commit as the structural change
  to save a second production deploy. **The CMS has since ADOPTED them** (re-scan → Adopt code
  values), verified in the database: published and draft both hold all ten names. If you ever
  do this again, the adopt step is not optional — without it the club's next Publish silently
  reverts the code edit.
- **A re-scan leaves a metadata-only draft.** `__repeater_meta__` lands in `draft_content`, so
  the client sees amber "unpublished changes" dots with nothing to review. Publishing to clear
  it spends a production deploy on a no-op. Logged in BACKLOG; do not chase it here.
- Supabase free tier pauses the booking project. Keep-alive ping still pending (BACKLOG).
- 9 live-editor smoke failures remain, all **section-name fragmentation** (one visual block
  split across several field prefixes, each owning a sliver of scroll). Fix by REGROUPING the
  field names, never by touching the editor's scroll anchor.
- This repo hit the scanner's **30-file cap** exactly (32 files). The two that fall off carry
  no editable fields today, but it is two files from silently dropping a real page.

## Open todos
- [ ] **Members CSV** from the office → load into the booking Supabase → flip `booking_live`
      to true. (owner: Dan/office, then you). This is the last thing before booking ships.
- [ ] **Confirm the $150 loading-area fine is on the right rule.** Dan wrote "vessels ... in
      the loading area"; it went on **Pontoon Berthing**. If he meant the vehicle loading zone
      it belongs on **Parking & Dinghies** instead. (owner: Dan)
- [ ] **Add Dan as a second CMS user** once CMS PR #32 is merged — People → tick Enquiries →
      send invite. His manager address, not `office@`. (owner: you)
- [ ] **Check `EMAIL_MANAGER`** in Netlify env is Dan's address, for booking emails. Needs a
      redeploy to take effect, so batch it. (owner: you)
- [ ] Committee **profile photos** when the club sends them — they upload these themselves,
      no dev work needed. (owner: Dan)
- [ ] Bridge `goTo` fix: copy `sitemog-starter/src/pubd-edit-bridge.js` in as a rider on the
      next real deploy. (owner: you)

## Session log (brief, newest first)
- 2026-08-25: Dan's post-AGM committee (10 people) + loading-area fine shipped; committee photo
  slot wired; empty-email dead links fixed; CMS re-scanned + values adopted; CONTEXT created.
- 2026-08-23: repeater layout converted to count-derived (merged).
- 2026-08-21: live-editor sweep — 18 → 9 smoke failures after the travelling-anchor fix.
- 2026-08-19: went LIVE on teatatuboatclub.co.nz (DNS at 1st Domains, SSL green).
