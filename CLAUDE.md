# EconCats — Economics Student Association website

Website for the Economics Student Association (ESA, "EconCats") at the University of Arizona.
ESA was formed by three organizations: EES ([EES FULL NAME]), WEC ([WEC FULL NAME]) and ODE (Omicron Delta Epsilon, ΟΔΕ).
The logo reads "Arizona · EES · WEC · ΟΔΕ · Est. 2026 · Economics Student Association".
Domain: econcats.com (registered at GoDaddy, DNS pointed to Vercel). Use "ESA" for the official name and "EconCats" as the site's voice and identity.

## Voice
- ESA welcomes undergraduates, graduate students and faculty. Show this through who we describe at events, never with phrases like "we represent all undergraduates" or "open to everyone". Keep the tone confident and specific.
- ESA's roots go back further than our records. Never give a founding year for economics student organizations at Arizona; use "for decades" or "generations of economics students" instead. Use specific dates only for verified milestones.

## Verified dates and facts
- WEC (Women in Economics Club) founded fall 2018 by economics lecturer Erin Yetter.
- ODE Arizona Beta reactivated 2026.
- EES constitution: November 13, 2024.
- Eller Experience Award, won as the Eller Economics Society.
- Omicron Delta Epsilon founded 1915. Arizona Beta eligibility: 3.0 GPA; 12 economics credits, waived after one year of active ESA membership. Applications each semester.

## Links (all in `src/data/site.json`)
- ESA Instagram @econcats: https://www.instagram.com/econcats/
- WEC Instagram @ua_wec: https://www.instagram.com/ua_wec/
- ESA LinkedIn: https://www.linkedin.com/company/106468095
- ODE International: https://www.omicrondeltaepsilon.org/
External links open in a new tab. Social links use `SocialLink.astro` (icon + visible handle).
Meeting day/time/place, dues, duesPaymentUrl (Square), weeklyEmailUrl (CampusGroups signup), and alumniFormUrl also live in `site.json`; pages and the footer read them from there.
No contact forms that submit anywhere: links and copy buttons (`CopyEmail.astro`) only.

## Facts to confirm before launch
Shown on the site in [brackets] until confirmed:
1. ODE "first time since 2007". (Member count removed from the home page for now: 19 admitted, 11 in the first inducted class.)
2. Permission from any alumni, supporters or members named on the site.
Do not mention EpicHire anywhere on the site.

## Stack
- Astro, static output, deployed on Vercel (not connected yet).
- No UI framework. Plain `.astro` components, one global stylesheet, a small amount of vanilla JS.
- `draft/` holds the first static HTML mock-up. It's a reference for porting the hero and pillars, not part of the build.

## Commands
- `npm run dev`: dev server at http://localhost:4321
- `npm run build`: builds to `dist/`
- `npm run preview`: serves the built site

## Brand tokens (from the ESA logo)
| Token | Hex | Use |
|---|---|---|
| `--esa-green` | #375D52 | Main ring, primary brand color |
| `--deep` | #1C3430 | Dark backgrounds, wordmark/text on light |
| `--mint` | #8DC4A0 | Wordmark/accents on dark |
| `--cyan` | #2AACCC | Second ring, WEC color (`--wec`) |
| `--navy` | #1A3A6A | Third ring, ODE color (`--ode`) |
| `--white` | #FFFFFF | Light background |

Fonts: Fraunces (display serif), Inter (body). Style: clean, editorial, art-portfolio feel with lots of white space.
Logo: `public/logo.png` (540×540, merged from the Canva PDF), used through `src/components/Logo.astro`.
Its center is transparent, so it always sits on a white disc. Ask for an SVG export from Canva for sharper large sizes.
Favicon (`public/favicon.png`), Apple touch icon and `og-image.png` use this logo; the old three-ring placeholder mark is retired.
Heritage logos in `public/logos/`: `ees.png` (Eller Economics Society) and `wec.jpg` (Women in Economics Club), shown on the Home and About org cards.
ODE has no logo file yet (it keeps the navy ring); get the official emblem from ODE International before adding one.

## Site map
| Page | Route | Content |
|---|---|---|
| Home | `/` | Hero, the three pillars, upcoming events, latest projects, "Join us" call to action |
| About | `/about` | Mission, the merger story, heritage (`#heritage`, `#ees`, `#wec`) |
| Activities | `/activities` | Upcoming and past events, photo gallery |
| Projects | `/projects` | ODE chapter, exam reviews, mentorship, alumni campaign, discussion series |
| Leadership | `/leadership` | Current board by role, member wall (`#members`, opt-in dues payers for the current semester), advisors, "Lead with us" |
| Alumni | `/alumni` | Spotlights, ways to get involved, supporters wall, reconnect form link |
| Join / Contact | `/join` | Meetings, dues, email, Instagram |
| Links | `/links` | Link-in-bio for Instagram: pay dues (Square), weekly email, next event, socials. No header/footer (`Layout bare`) |

## Rules
- Mobile-first: write base styles for phones, add `min-width` media queries for larger screens.
- Content comes from data, never hard-coded into pages. Pages read it only through `src/lib/content.ts`.
  Eight collections (events, projects, board, advisors, alumni, supporters, achievements, members) load from the
  "ESA Website Content" Google Sheet at build time (CSV URLs in `src/data/sources.json`, loader `src/lib/sheet.ts`),
  falling back to `src/data/*.json`. Board-member guide: `docs/updating-the-site.md`.
  Exception: Home hero/pillars and About are mostly static and may be written into the page.
- No University of Arizona logos or trademarks (no Wilbur/Wildcat marks, no block A).
- Never invent facts: names, dates, quotes, numbers, links. Unknown values go in `[SQUARE BRACKETS]`.
- Only publish photos, names and quotes of people who have agreed, especially alumni and supporters.
- Keyboard focus must stay visible; check every page at phone width (375px).
- One build step per session: check in the browser, commit, then move on.

## Build prompts
The step-by-step prompts for the remaining pages live in `docs/build-prompts.md`. Run one per session, in order.

## Build order
0. Setup ✅ · 1. Foundation (layout, nav, empty pages) · 2. Home and About · 3. Data-driven pages with sample JSON ·
4. Google Sheet as CSV at build time + daily rebuild · 5. Photos with Astro `<Image>` · 6. Polish (favicon, meta, 404) ·
7. Launch on Vercel with the club account · 8. Handover guide.
