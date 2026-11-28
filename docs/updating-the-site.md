# How to update the EconCats website

You don't need to touch any code. Almost everything on the site comes from one Google Sheet:
**ESA Website Content**, in the ESA Google Drive.

1. Open the sheet and edit the right tab (see the table below).
2. The site picks up your changes the next time it is rebuilt. It rebuilds whenever the code changes; to publish sheet edits on their own, see [Update the site right now](#update-the-site-right-now).

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
| `members` | Dues-paying members who want to be listed | Leadership (member wall) |

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
| `photos` | Photo paths, comma-separated, optional (see [Photos](#photos)) | `fall-2026/ode-info-1.jpg` |
| `photo_alts` | One description per photo, same order, separated by `\|` | `Students at the October ODE information session` |
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

### `members`

The Treasurer adds a row when someone pays dues.

| Column | What to put | Example |
|---|---|---|
| `name` | Name as they want it shown | `Alex Rivera` |
| `year` | Optional, e.g. class year or `Grad student` | `Sophomore` |
| `through` | Last semester their dues cover: `Spring YYYY` or `Fall YYYY` | `Spring 2027` |
| `permission` | **`TRUE` only if they said yes to being listed.** Ask when they pay. | `TRUE` |

- Semester dues: `through` is that semester. Year dues paid in fall: `through` is the next spring.
- Names drop off the wall by themselves once `through` is in the past, so renewing puts them back. Over the summer, spring members stay listed.
- Keep everyone who paid in this tab, listed or not. It doubles as the dues record.

> **Alumni, supporters and members appear only when `permission` is `TRUE`.** Anything else, including a blank cell, keeps them off the site.

---

## Photos

Photos are the one thing that isn't in the sheet: the files go into the website's code folder,
and the sheet only lists their names.

**Before adding any photo:**

- **Resize it to at most 2000 px on the long edge.** Phone photos are often 4000 px or more; shrink them first
  (Windows Photos → Resize, or Preview on a Mac). The site makes smaller, faster versions automatically.
- **Only post people who've agreed to be photographed and to appear on the site.** If someone asks to be
  removed, take the photo down.
- **Describe what's in the photo** for people using screen readers, e.g.
  "Students at the October ODE information session". Never "image", "photo" or a file name.

**Where they go** (ask the site maintainer to add the files, or add them on GitHub):

| What | Folder | Listed in |
|---|---|---|
| Home page hero | `src/assets/photos/home/hero.jpg` | Description goes in `src/pages/index.astro` (`heroAlt`) |
| Event photos | `src/assets/photos/<semester>/`, e.g. `fall-2026/` | `events` tab: `photos` and `photo_alts` |
| Board headshots | `src/assets/photos/board/` | `board` tab: `photo` |
| Alumni headshots | `src/assets/photos/alumni/` | `alumni` tab: `photo` |

In the sheet, write the path **after** `photos/`, for example `fall-2026/ode-info-1.jpg`.
For events with several photos, separate the paths with commas in `photos`, and write one description per photo
in `photo_alts`, **in the same order, separated by `|`**:

| photos | photo_alts |
|---|---|
| `fall-2026/ode-info-1.jpg, fall-2026/ode-info-2.jpg` | `Students at the October ODE information session \| The VP of ODE explaining eligibility` |

Board members and alumni without a photo get a circle with their initials instead.

---

## Update the site right now

1. Open the `econcats` project on Vercel (club account) and go to **Deployments**.
2. On the newest production deployment, open the **⋯** menu and choose **Redeploy**.
3. Wait about 1–2 minutes, then refresh the site.

---

## What is *not* in the sheet

These need a small code change (ask whoever maintains the site):

- Contact details, meeting day/time/place, dues, form links: `src/data/site.json`
- The About page timeline, mission pillars and past presidents: `src/data/timeline.json`, `pillars.json`, `presidents.json`
- Page text such as headings and intros

---

## If something looks wrong

- **Your change didn't show up:** rebuild the site (above). Check the tab was published (File → Share → Publish to web) and the row isn't marked `draft` = `TRUE`.
- **A whole section went back to old content:** the site couldn't read the sheet and used its backup copy. Check that the tab is still published as CSV, and that row 1 still has the column names.
- **An event is in the wrong place:** check the `date` is `YYYY-MM-DD`.
- **Still stuck:** ask the Director of Media, who owns the content sheet.

---

## For whoever maintains the site

- Published CSV URLs live in `src/data/sources.json`, one per tab. An empty URL means "use the JSON file".
- The loader is `src/lib/sheet.ts`. If a URL is empty or a fetch fails, it logs a `[sheet]` warning and falls back to `src/data/<tab>.json`. The build never fails because of the sheet.
- The JSON files double as examples of each tab's column format.
- There is no scheduled rebuild. The daily GitHub Action was removed in November 2026 after every run failed; production deploys from `main`, and sheet-only changes need a manual redeploy on Vercel.
