# EconCats website — build prompts

Run one prompt per session, in order. After each one: check it in the browser at desktop and phone width,
fix anything off with a short follow-up prompt, then commit:

```
git add .
git commit -m "<what you built>"
```

Every prompt assumes CLAUDE.md is in place (brand tokens, site map, Voice rules).

Status: Home ✅ · About ✅ · Projects (3) in progress

---

## Prompt 3 · Projects page

Build the Projects page using the existing Layout and styles, following the Voice rules in CLAUDE.md. Projects come from `src/data/projects.json`; each project has: id, title, status ("Active", "Growing", "Planned"), pillar ("Connect", "Grow", "Access"), summary (2–3 sentences), lead_role (a role, never a person's name), and an optional link.

Page structure:

1. Intro. Heading: "What we're building." Text: "Projects are the long-running work behind ESA: things we build once and keep improving every semester."
2. A filter row for All / Connect / Grow / Access that filters the cards without reloading.
3. Project cards in a responsive grid, each with a status chip and pillar tag. Each card links to its anchored detail section further down the page (`id` = project id).
4. Detail sections for each project, in order.

The ODE section (`id="ode"`) already has its content. Keep it, or create it if missing, with:

* Title: "Omicron Delta Epsilon · Arizona Beta Chapter"
* Text: "Omicron Delta Epsilon (OΔE) is one of the world's largest academic honor societies, recognizing scholarly achievement in economics since 1915. The University of Arizona's Arizona Beta chapter returned in 2026 and is run by ESA with the Department of Economics."
* Eligibility: 3.0 GPA; 12 economics credits, waived after one year of active ESA membership.
* "Applications open each semester. Follow @econcats for the next cycle."
* Button "Visit ODE International" → https://www.omicrondeltaepsilon.org/ (new tab)

Seed projects.json with these:

* ode: ODE Arizona Beta · Access · Growing · "Growing the honor society chapter we reactivated in 2026, with a new cohort every year." Lead: VP of ODE.
* exam-reviews: Exam reviews · Grow · Active · "Peer-led reviews before ECON 200, 361 and 332 exams. Free for members." Lead: VP of Academic Programs.
* alumni: Reconnecting alumni · Connect · Active · "Finding the economics students who came before us, and bringing them back as speakers, mentors and supporters." Lead: President. Link: /alumni
* discussion-series: Economics discussion series · Grow · Planned · "Small-group sessions on big ideas in economics, starting with Elinor Ostrom's work on governing the commons." Lead: VP of Academic Programs.
* mentorship: Peer mentorship · Grow · Planned · "Pairing newer members with experienced students for classes, careers and campus life." Lead: VP of Academic Programs.

Run the dev server and check that /projects#ode works from the home page link.

## Prompt 4 · Activities page

Build the Activities page using the existing Layout and styles. Events come from `src/data/events.json`; each event has: date (YYYY-MM-DD), time, title, type ("General meeting", "Speaker", "Workshop", "Exam review", "Social", "ODE", "WEC", "Service", "Collaboration"), pillar, location, summary, an optional photos array of image paths, and an optional recap (2–3 sentences, for past events).

Page structure:

1. Intro. Heading: "What EconCats do." Text: "Weekly meetings, speakers, workshops, exam reviews and socials, every week of the semester."
2. "Coming up": events dated today or later, soonest first, as cards with date block, title, type chip, time and location. Empty state: "Our next schedule is coming soon. Meetings are Thursdays at 5 PM during the semester."
3. "Our weekly rhythm": a simple four-step strip showing the monthly Thursday cycle: General meeting → Speaker → Workshop or employer event → Committee meeting.
4. "Past events": a list grouped by semester (e.g. "Fall 2026"), newest first, with the recap text. If an event has photos, show a small thumbnail row that opens a lightbox gallery (keyboard accessible, Esc to close).

Dates are computed at build time; past and upcoming events are sorted automatically.

Seed events.json with these past events (no photos yet):

* 2026-09-03 · First ESA general meeting · General meeting · Connect
* 2026-09-10 · Tax Foundation speaker · Speaker · Grow
* 2026-09-17 · Résumé and LinkedIn workshop · Workshop · Grow
* 2026-10-01 · Midterm study session · Exam review · Grow
* 2026-10-08 · ODE information session · ODE · Access
* 2026-10-17 · Eller Make a Difference Day · Service · Connect
* 2026-10-29 · Halloween social with the Philosophy Club · Collaboration · Connect
* 2026-11-12 · TQL career talk · Speaker · Grow

Write a one-sentence summary for each, in the Voice rules' tone. Don't invent attendance numbers or outcomes.

## Prompt 5 · Leadership page

Build the Leadership page using the existing Layout and styles. Board members come from `src/data/board.json`; each entry has: role, name, year (e.g. "Junior"), major, optional photo path, optional one-line bio, optional LinkedIn URL, and group ("Coordination", "Domain leads", "Directors").

Page structure:

1. Intro. Heading: "Who runs the EconCats." Text: "ESA is run by students who give their time to build something that lasts beyond them. Every board member goes through onboarding and training before they start."
2. Board grid grouped by "Coordination" (President, Vice President, Secretary, Treasurer), "Domain leads" (VP of ODE, VP of Academic Programs, VP of WEC Programs) and "Directors" (Media, Engagement). Cards show photo (or initials in a ring-color circle if there's no photo), name, role, year and major, and a LinkedIn icon if present.
3. If board.json has no names yet, show the roles only, with the line: "Our spring 2027 board is forming. Meet them here soon."
4. "Our faculty advisors": read from `src/data/advisors.json` (name, title, department). Leave it empty for now and show "Coming soon".
5. "Lead with us": "Interested in leading? Board and committee roles open each semester. Every new leader is trained before they start." Button "Get in touch" → /join

Seed board.json with the roles only, with name fields left empty. Do not add any real names.

## Prompt 6 · Alumni page

Build the Alumni page using the existing Layout and styles, following the Voice rules in CLAUDE.md. Data comes from `src/data/alumni.json` (name, years, org ["EES", "WEC", "ODE"], now (current role), quote, optional photo, optional LinkedIn, permission: true/false) and `src/data/supporters.json` (name, type ["Founding supporter", "Alumni speaker", "Mentor"], year, permission: true/false). Only show entries where permission is true.

Page structure:

1. Hero. Heading: "Once an EconCat, always an EconCat." Text: "Our alumni span generations of economics students at Arizona, across the Eller Economics Society, WEC and ODE. Wherever you are now, there's a place for you here."
2. "Ways to get involved" (`id="involved"`): four items:
   * Tell us where you are now
   * Speak to students (in person or on Zoom)
   * Mentor a student
   * Support ESA (`id="support"`): "Gifts fund exam reviews, speaker events and ODE initiation fees. A giving link through the University of Arizona is coming soon. Email us in the meantime."
3. "Alumni spotlights": cards from alumni.json. Empty state: "Our first alumni spotlights are coming soon."
4. "Supporters wall": names grouped by type. Empty state with dashed slots: "Be one of our founding supporters."
5. "Reconnect": a button "Reconnect with ESA" linking to a Google Form URL stored in `src/data/site.json` as `alumniFormUrl`. Until that URL is set, show the club email with a copy button: arizonaeconsociety@gmail.com.

Leave alumni.json and supporters.json empty. Do not invent names.

## Prompt 7 · Join / Contact page

Build the Join page using the existing Layout and styles. Store contact details in `src/data/site.json` (email, instagram, wecInstagram, meetingDay, meetingTime, meetingPlace, weeklyEmailUrl, duesSemester, duesYear, alumniFormUrl) and read every value from there, on this page and in the footer.

Values: email arizonaeconsociety@gmail.com; instagram https://www.instagram.com/econcats/; wecInstagram https://www.instagram.com/ua_wec/; meetingDay "Thursdays"; meetingTime "5 PM"; meetingPlace "McClelland Hall (room in the weekly email)"; duesSemester "$15"; duesYear "$25"; weeklyEmailUrl and alumniFormUrl empty for now.

Page structure:

1. Heading: "Come once. You'll know if it's for you." Text: "No application needed. Pull up a chair at any Thursday meeting."
2. Three steps: "Come to a meeting" → "Get the weekly email" → "Join and pay dues". Dues text: "$15 a semester or $25 a year. Dues fund food, speakers and events."
3. "Get the weekly email": a button to weeklyEmailUrl if set; otherwise "Email us and we'll add you" with a copy button.
4. Contact cards: email (with copy button), @econcats, @ua_wec.
5. "Partners and speakers": "Faculty, employers and alumni who'd like to speak or partner with ESA: email us."

Don't use a contact form that submits anywhere. Links and copy buttons only.

## Prompt 8 · Connect the Google Sheet

Before running this: create a Google Sheet "ESA Website Content" in the ESA Drive with tabs events, projects, board, advisors, alumni, supporters, achievements. Use the same column names as the JSON files. Then for each tab: File → Share → Publish to web → choose the tab → CSV, and copy the URL.

Replace the JSON data files with data fetched from published Google Sheets CSVs at build time. Put the CSV URLs in `src/data/sources.json`, one per collection: events, projects, board, advisors, alumni, supporters, achievements.

Requirements:

* Write one loader `src/lib/sheet.ts` that fetches a CSV URL, parses it (handle quoted fields and commas inside them), trims values, and returns typed objects. Booleans "TRUE"/"FALSE" become true/false; photos are comma-separated paths.
* If a fetch fails or a URL is empty, fall back to the existing JSON file and log a warning. The build must never fail because of the sheet.
* Keep the JSON files as fallbacks and as examples of the column format.
* Add `.github/workflows/daily-rebuild.yml` that calls a Vercel Deploy Hook once a day at 9 AM Arizona time (16:00 UTC), plus a manual "Run workflow" button. The hook URL comes from a GitHub secret `VERCEL_DEPLOY_HOOK`.
* Write `docs/updating-the-site.md` explaining, for a non-technical board member: which tab controls which page, the column format, that changes appear within a day, how to trigger an immediate update from GitHub Actions, and that alumni and supporters appear only when permission is TRUE.

## Prompt 9 · Photos

Set up photos across the site. Put images in `src/assets/photos/<event-or-section>/` and use Astro's `<Image>` component everywhere, with width and height set, lazy loading below the fold, and modern formats. Add:

* A hero photo slot on the home page, with a dark gradient overlay so text stays readable in both themes.
* Event galleries on Activities, read from each event's photos list.
* Headshots on Leadership and Alumni, falling back to initials circles.

Every image needs real alt text describing the scene ("Students at the October ODE information session"), never "image" or a filename. Add a note to docs/updating-the-site.md: resize photos to at most 2000 px on the long edge before adding them, and only post people who've agreed to be photographed.

## Prompt 10 · Polish

Do a polish pass across the whole site:

* Favicon and Apple touch icon made from the three-ring logo mark (SVG plus 180 px PNG).
* A title and meta description for each page, plus Open Graph tags with a default share image (green background, "Home of the EconCats", ring mark).
* A 404 page in the site's voice with links home and to /join.
* Check every page at 375 px, 768 px and 1280 px: no horizontal scrolling, nav works, tap targets at least 44 px.
* Visible keyboard focus everywhere; the mobile menu traps focus and closes on Esc.
* Respect prefers-reduced-motion.
* Run a Lighthouse check and fix anything under 90 for accessibility and performance.
* Search the site for "2011", "EpicHire", "represent all" and "open to everyone", and fix any that slipped back in.

List what you changed.

## Prompt 11 · Launch

Do these yourself, logged into the club's accounts:

1. Push the repo to the club's GitHub account.
2. On vercel.com (club account): Add New → Project → import the repo. Astro is detected automatically.
3. Domains → buy econcats.org → assign it to the project.
4. Settings → Git → Deploy Hooks → create one named "daily", copy the URL, and add it to GitHub → Settings → Secrets → Actions as `VERCEL_DEPLOY_HOOK`.

Then ask Claude Code:

The site is deployed at econcats.org. Add a `README.md` covering how to run the site locally, how deploys work (push to main deploys automatically; the sheet updates daily), where the content lives, and who owns the accounts (roles, not names). Link docs/updating-the-site.md from it.

## Prompt 12 · Handover

Not a coding step. Add a line to the Board Onboarding Guide and to Responsibilities by Priority: "The Director of Media owns the website's content sheet; the President owns the domain and hosting accounts." Then walk Brody and Guli through editing the sheet once before break.
