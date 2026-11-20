# EconCats — Economics Student Association website

Website for the Economics Student Association (ESA, "EconCats") at the University of Arizona.
ESA was formed by three organizations: EES ([EES FULL NAME]), WEC ([WEC FULL NAME]) and ODE (Omicron Delta Epsilon, ΟΔΕ).
The logo reads "Arizona · EES · WEC · ΟΔΕ · Est. 2026 · Economics Student Association".
Domain: [econcats.com or econcats.org — not decided].

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

## Site map
| Page | Route | Content |
|---|---|---|
| Home | `/` | Hero, the three pillars, upcoming events, latest projects, "Join us" call to action |
| About | `/about` | Mission, the merger story, history timeline from 2011 |
| Activities | `/activities` | Upcoming and past events, photo gallery |
| Projects | `/projects` | ODE chapter, exam reviews, mentorship, alumni campaign, discussion series |
| Leadership | `/leadership` | Current board by role, advisors, "Lead with us" |
| Alumni | `/alumni` | Spotlights, ways to get involved, supporters wall, reconnect form link |
| Join / Contact | `/join` | Meetings, dues, email, Instagram |

## Rules
- Mobile-first: write base styles for phones, add `min-width` media queries for larger screens.
- Content comes from data files (`src/data/*.json`, later the Google Sheet), never hard-coded into pages.
  Exception: Home hero/pillars and About are mostly static and may be written into the page.
- No University of Arizona logos or trademarks (no Wilbur/Wildcat marks, no block A).
- Never invent facts: names, dates, quotes, numbers, links. Unknown values go in `[SQUARE BRACKETS]`.
- Only publish photos, names and quotes of people who have agreed, especially alumni and supporters.
- Keyboard focus must stay visible; check every page at phone width (375px).
- One build step per session: check in the browser, commit, then move on.

## Build order
0. Setup ✅ · 1. Foundation (layout, nav, empty pages) · 2. Home and About · 3. Data-driven pages with sample JSON ·
4. Google Sheet as CSV at build time + daily rebuild · 5. Photos with Astro `<Image>` · 6. Polish (favicon, meta, 404) ·
7. Launch on Vercel with the club account · 8. Handover guide.
