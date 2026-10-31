# Kit theme

The kit (this folder) is **shared**: the same on every site, synced from
sitemog-starter with `sitemog-toolkit/scripts/sync-kit.sh <repo>`. Never edit
`KitSection.jsx`, `ScrollStrip.jsx`, `Photo.jsx`, `framing.js`, `useKit.js`,
`Announcement.jsx`, `HeroPhotos.jsx`, `until.js`, `kit.css` or this file in a client site; change them in the starter and sync.

A site makes the kit its own with two things it **does** own:

1. **`src/kit/theme.js`**: the few choices CSS cannot make (a brand mark for
   card icons, left or centred headings, how numbers sit).
2. **The KIT THEME block in `src/index.css`**: every role below, mapped with
   `@apply` to the site's own colours, fonts, buttons and cards. Point at what
   the site already has (`@apply btn-primary`, `@apply card`) rather than
   restyling, so an added section matches the site's own sections exactly.

Adding the kit to a site: sync, write the theme (start from the starter's block
and swap in the site's names), add `Sections` + `useKit` to each page, build,
then compare a page of every type against the site's own sections.

## Roles (style every one)

| Role | What it is |
|---|---|
| `kit-section` | A section's box: width, side padding, top and bottom padding (usually `@apply section`) |
| `kit-numbers` | Extra on the numbers section's box (its padding is usually tighter) |
| `kit-head` | A heading block; set `--kit-head-gap` (default 0.75rem) |
| `kit-eyebrow` | The small line above a heading |
| `kit-h2` | A section heading |
| `kit-h3` | A small heading (a card, a person, a step) |
| `kit-card-title` | Extra on a card's title (often a size up) |
| `kit-person` | Extra on a featured person's name (a `kit-h2`) |
| `kit-intro` | The line under a section heading |
| `kit-text` | Running text (a text section's body, a bio, an answer) |
| `kit-small` | A card's or step's short text |
| `kit-step-text` | A timeline step's text |
| `kit-meta` | Captions, a reviewer's business |
| `kit-accent` | Small brand-coloured text (a step's date, the FAQ +) |
| `kit-role` | A person's role; `.kit-head > .kit-role` for the featured one |
| `kit-name` | A reviewer's name |
| `kit-quote` | A quote in a card |
| `kit-quote-lg` | The one featured quote |
| `kit-cta-text` | The line in a call-to-action band |
| `kit-card` | A card (usually `@apply card`) |
| `kit-card-photo` | Extra on a card with a photo on top (usually no padding) |
| `kit-card-body` | The words under that photo (the card's padding) |
| `kit-photo` | A large photo's frame (rounding, shadow) |
| `kit-tile` | A photo in a grid or strip, a square logo |
| `kit-logo` | A logo in a logo strip (often nothing, or a greyscale) |
| `kit-mark` | The round badge on an icon card: size, background, colour |
| `kit-step` | The round number on a step: size, background, colour, font |
| `kit-face` | A person's round photo or initials: background, colour, font |
| `kit-dot` | A timeline's dot |
| `kit-figure` | A big number |
| `kit-figure-label` | The label under it |
| `kit-numbers-heading` | The numbers section's heading |
| `kit-question` | An FAQ question |
| `kit-btn-primary` / `kit-btn-secondary` | The site's two buttons (`@apply btn-primary` …) |
| `kit-file` | A download row (its hover; the rules between rows are `--kit-rule`) |
| `kit-price` | A package's price, large |
| `kit-price-row` | A price in the price list |
| `kit-price-unit` | The unit after a price ("per tonne", "/month") |
| `kit-package` | Extra on a package card |
| `kit-package-highlight` | The highlighted package (a ring, the brand colour) |
| `kit-announce` | The announcement strip across the top: background, colour, padding, font |
| `kit-announce-text` | Its line (a link gets the site's hover, if any) |

Spacing between the parts of a heading block is the default gap unless the
theme sets a pair: `.kit-eyebrow + .kit-h2`, `.kit-h2 + .kit-intro`,
`.kit-h2 + .kit-text`, `.kit-text + .kit-actions`, `.kit-cta-text + .kit-actions`,
`.kit-h2 + .kit-role`, `.kit-role + .kit-text`.

One type only: every section sits inside `kit-type-<type>` (`kit-type-cards`,
`kit-type-numbers` …), so `.kit-type-cards .kit-section { … }` tunes just that one.

Variables: `--kit-rule` (lines: timeline, FAQ, numbers dividers),
`--kit-arrow-bg` and `--kit-arrow-fg` (the strip's arrows).

## Site-wide pieces (wired once per site, not added from the editor)

- **Announcement** (`Announcement.jsx`): in the layout, above the nav, with the site's
  own editable line as its child and a hidden span for the link (copy the starter's
  Layout.jsx). Keys `nav_announcement`, `nav_announcement_link` and `nav_announcement_until`
  in content.js, empty by default. `until` needs `define: { __BUILT_AT__: JSON.stringify(Date.now()) }`
  in vite.config.js (see until.js). The fields live in the site's code, not the kit, so the scanner can read them.
- **HeroPhotos** (`HeroPhotos.jsx`): in place of the hero's single photo, given the hero
  photo and a `<page>_hero_more` list, plus a hidden `data-cms-repeater="<Page> - Hero -
  More Photos"` (`data-cms-shape="media"`, `data-cms-max="5"`) of `<img data-cms-field="image">`
  so the CMS can edit the list. One photo looks exactly as before. See the starter's Home.

