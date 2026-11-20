# How to update the EconCats website

You don't need to touch any code. Almost everything on the site comes from one Google Sheet:
**ESA Website Content**, in the ESA Google Drive.

1. Open the sheet and edit the right tab (see the table below).
2. Wait. The site rebuilds **every day at 9 AM Arizona time** and picks up your changes.
3. Need it sooner? See [Update the site right now](#update-the-site-right-now).

---

## Which tab controls which page

| Tab | What it controls | Where it shows up |
|---|---|---|
| `events` | Every meeting and event | Activities (Coming up, Past events), Home (Coming up) |
| `projects` | Long-running projects | Projects page, Home (What we're building) |
| `board` | The student board | Leadership |
| `advisors` | Faculty advisors | Leadership, About |
| `alumni` | Alumni spotlights | Alumni |
| `supporters` | Supporters wall | Alumni, Home (alumni band) |
| `achievements` | Awards for EES, WEC and ODE | About (Our heritage) |

**Row 1 of every tab holds the column names. Don't rename, reorder-and-rename, or delete them.**
You can add extra columns for your own notes; the site ignores columns it doesn't know.

---

## How to fill in the columns

General rules for every tab:

- **Yes/no columns** (`permission`, `draft`, `featured`): type `TRUE` or `FALSE`. A checkbox works too.
- **Dates**: always `YYYY-MM-DD`, e.g. `2027-02-04`. Other formats break sorting.
- **Lists** (`photos`, `org`): separate items with commas, e.g. `EES, ODE`.
- **Empty is fine** for optional columns. Leave the cell blank.
- **Blank rows are skipped.**
- Never put a person's name, photo or quote on the site without their permission.

### `events`

| Column | What to put | Example |
|---|---|---|
| `date` | Date of the event, `YYYY-MM-DD` | `2027-02-04` |
| `time` | Start time, optional | `5 PM` |
| `title` | Event name | `Résumé and LinkedIn workshop` |
| `type` | One of: `General meeting`, `Speaker`, `Workshop`, `Exam review`, `Social`, `ODE`, `WEC`, `Service`, `Collaboration` | `Workshop` |
| `pillar` | One of: `Connect`, `Grow`, `Access` | `Grow` |
| `location` | Where, optional | `McClelland Hall` |
| `summary` | One sentence about the event | |
| `photos` | Photo paths, comma-separated, optional | `fall-2026/odeinfo-1.jpg` |
| `recap` | 2–3 sentences after the event happens, optional | |
| `draft` | `TRUE` hides the event from the live site until you're sure | `FALSE` |

Events dated today or later appear under **Coming up**; older ones move to **Past events** automatically.

### `projects`

| Column | What to put |
|---|---|
| `id` | Short name with no spaces, used in links, e.g. `exam-reviews`. Don't change it once set. |
| `title` | Project name |
| `status` | `Active`, `Growing` or `Planned` |
| `pillar` | `Connect`, `Grow` or `Access` |
| `summary` | 2–3 sentences |
| `lead_role` | A **role**, never a person's name, e.g. `VP of Academic Programs` |
| `link` | Optional page link, e.g. `/alumni` |
| `featured` | `TRUE` to show it on the home page (pick three) |

The ODE project's detail section (`id` = `ode`) has fixed text on the page; only its card and status come from the sheet.

### `board`

| Column | What to put |
|---|---|
| `role` | e.g. `President`, `VP of ODE`, `Director of Media` |
| `name` | Full name. Leave blank until the person is confirmed. |
| `year` | e.g. `Junior` |
| `major` | e.g. `Economics` |
| `photo` | Optional headshot path |
| `bio` | Optional, one line |
| `linkedin` | Optional full LinkedIn URL |
| `group` | `Coordination`, `Domain leads` or `Directors` |

While every `name` is blank, the page shows the roles with "Our spring 2027 board is forming."

### `advisors`

`name`, `title`, `department`. While the tab is empty, the site shows "Coming soon."

### `alumni`

| Column | What to put |
|---|---|
| `name` | Full name |
| `years` | e.g. `2019–2023` |
| `org` | Any of `EES`, `WEC`, `ODE`, comma-separated |
| `now` | Current role, e.g. `Analyst at …` |
| `quote` | A short quote, in their words |
| `photo` | Optional |
| `linkedin` | Optional |
| `permission` | **`TRUE` only after they've said yes in writing.** |

### `supporters`

`name`, `type` (`Founding supporter`, `Alumni speaker` or `Mentor`), `year`, `permission`.

### `achievements`

`org` (`ees`, `wec` or `ode`, lowercase), `title`, `year` (optional).

> **Alumni and supporters appear only when `permission` is `TRUE`.** Anything else, including a blank cell, keeps them off the site.

---

## Update the site right now

1. Go to the website's repository on GitHub (club account).
2. Click **Actions** → **Daily rebuild** → **Run workflow** → **Run workflow**.
3. Wait about 3–5 minutes, then refresh the site.

---

## What is *not* in the sheet

These need a small code change (ask whoever maintains the site):

- Contact details, meeting day/time/place, dues, form links: `src/data/site.json`
- The About page timeline, mission pillars and past presidents: `src/data/timeline.json`, `pillars.json`, `presidents.json`
- Page text such as headings and intros

---

## If something looks wrong

- **Your change didn't show up:** wait for the 9 AM rebuild, or run it now (above). Check the tab was published (File → Share → Publish to web) and the row isn't marked `draft` = `TRUE`.
- **A whole section went back to old content:** the site couldn't read the sheet and used its backup copy. Check that the tab is still published as CSV, and that row 1 still has the column names.
- **An event is in the wrong place:** check the `date` is `YYYY-MM-DD`.
- **Still stuck:** ask the Director of Media, who owns the content sheet.

---

## For whoever maintains the site

- Published CSV URLs live in `src/data/sources.json`, one per tab. An empty URL means "use the JSON file".
- The loader is `src/lib/sheet.ts`. If a URL is empty or a fetch fails, it logs a `[sheet]` warning and falls back to `src/data/<tab>.json`. The build never fails because of the sheet.
- The JSON files double as examples of each tab's column format.
- The daily rebuild is `.github/workflows/daily-rebuild.yml`. It needs the GitHub secret `VERCEL_DEPLOY_HOOK`.
