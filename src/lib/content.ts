// All site content goes through this file. Pages only use these helpers.
//
// The eight sheet-backed collections are loaded once per build from the
// "ESA Website Content" Google Sheet (published CSV URLs in src/data/sources.json).
// If a URL is empty or the fetch fails, the matching src/data/*.json file is used instead.
import site from '../data/site.json';
import sources from '../data/sources.json';
import { loadCollection } from './sheet';

import eventsJson from '../data/events.json';
import projectsJson from '../data/projects.json';
import boardJson from '../data/board.json';
import advisorsJson from '../data/advisors.json';
import alumniJson from '../data/alumni.json';
import supportersJson from '../data/supporters.json';
import achievementsJson from '../data/achievements.json';
import membersJson from '../data/members.json';

const [events, projects, boardData, advisorsData, alumniData, supporters, achievementsData, membersData] = await Promise.all([
  loadCollection('events', sources.events, eventsJson as unknown[], {
    listFields: ['photos'],
    expectedColumns: ['date', 'time', 'title', 'type', 'pillar', 'location', 'summary', 'photos', 'photo_alts', 'recap'],
  }),
  loadCollection('projects', sources.projects, projectsJson as unknown[], {
    expectedColumns: ['id', 'title', 'status', 'pillar', 'summary', 'lead_role', 'link'],
  }),
  loadCollection('board', sources.board, boardJson as unknown[], {
    expectedColumns: ['role', 'name', 'year', 'major', 'photo', 'bio', 'linkedin', 'group'],
  }),
  loadCollection('advisors', sources.advisors, advisorsJson as unknown[], {
    expectedColumns: ['name', 'title', 'department'],
  }),
  loadCollection('alumni', sources.alumni, alumniJson as unknown[], {
    listFields: ['org'],
    expectedColumns: ['name', 'years', 'org', 'now', 'quote', 'photo', 'linkedin', 'permission'],
  }),
  loadCollection('supporters', sources.supporters, supportersJson as unknown[], {
    expectedColumns: ['name', 'type', 'year', 'permission'],
  }),
  loadCollection('achievements', sources.achievements, achievementsJson as unknown[], {
    expectedColumns: ['org', 'title', 'year'],
  }),
  loadCollection('members', sources.members, membersJson as unknown[], {
    expectedColumns: ['name', 'year', 'through', 'permission'],
  }),
]);

/** "Thursdays at 5 PM during the semester", built from site.json */
export const meetingsLine = `${site.meetingDay} at ${site.meetingTime} during the semester`;

export type Pillar = 'Connect' | 'Grow' | 'Access';

export type EventType =
  | 'General meeting' | 'Speaker' | 'Workshop' | 'Exam review' | 'Social'
  | 'ODE' | 'WEC' | 'Service' | 'Collaboration';

export interface EventItem {
  date: string; // YYYY-MM-DD
  time: string; // e.g. "5 PM"; may be empty
  title: string;
  type: EventType;
  pillar: Pillar;
  location: string; // may be empty
  summary: string;
  photos?: string[]; // paths under src/assets/photos/, e.g. "fall-2026/ode-info-1.jpg"
  photo_alts?: string; // one description per photo, in the same order, separated by "|"
  recap?: string; // 2–3 sentences, for past events
  draft?: boolean;
}

/** Today's date in Arizona, as YYYY-MM-DD (computed at build time). */
export function todayInArizona(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Phoenix' }).format(new Date());
}

/** "Fall 2026", "Spring 2027", "Summer 2027" */
export function semesterOf(date: string): string {
  const [y, m] = date.split('-').map(Number);
  const term = m <= 5 ? 'Spring' : m <= 7 ? 'Summer' : 'Fall';
  return `${term} ${y}`;
}

export type ProjectStatus = 'Active' | 'Growing' | 'Planned';

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  pillar: Pillar;
  summary: string;
  lead_role: string; // a role, never a person's name
  link?: string;
  featured?: boolean; // shown on the home page
}

export function allProjects(): Project[] {
  return projects as Project[];
}

export type SupporterType = 'Founding supporter' | 'Alumni speaker' | 'Mentor';
export const supporterTypes: SupporterType[] = ['Founding supporter', 'Alumni speaker', 'Mentor'];

export interface Supporter {
  name: string;
  type: SupporterType;
  year: string;
  permission: boolean; // only shown when true
}

/** Supporters with permission, grouped by type (empty groups left out). */
export function supportersByType(): { type: SupporterType; names: Supporter[] }[] {
  const ok = (supporters as Supporter[]).filter((s) => s.permission === true);
  return supporterTypes
    .map((type) => ({ type, names: ok.filter((s) => s.type === type) }))
    .filter((g) => g.names.length > 0);
}

// ---------- Alumni ----------

export interface Alum {
  name: string;
  years: string; // e.g. "2019–2023"
  org: ('EES' | 'WEC' | 'ODE')[];
  now: string; // current role
  quote: string;
  photo?: string;
  linkedin?: string;
  permission: boolean; // only shown when true
}

export const publicAlumni = () => (alumniData as Alum[]).filter((a) => a.permission === true);

// Rows marked "draft" show in `npm run dev` only, never in the built site.
const visible = <T extends { draft?: boolean }>(rows: T[]) =>
  rows.filter((r) => !r.draft || import.meta.env.DEV);

export function upcomingEvents(limit = Infinity): EventItem[] {
  const today = todayInArizona();
  return visible(events as EventItem[])
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

/** Past events grouped by semester, newest semester and newest event first. */
export function pastEventsBySemester(): { semester: string; events: EventItem[] }[] {
  const today = todayInArizona();
  const past = visible(events as EventItem[])
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const groups = new Map<string, EventItem[]>();
  for (const e of past) {
    const s = semesterOf(e.date);
    groups.set(s, [...(groups.get(s) ?? []), e]);
  }
  return [...groups].map(([semester, events]) => ({ semester, events }));
}

export function featuredProjects(limit = 3): Project[] {
  return (projects as Project[]).filter((p) => p.featured).slice(0, limit);
}

export function publicSupporters(limit = 6): Supporter[] {
  return (supporters as Supporter[]).filter((s) => s.permission === true).slice(0, limit);
}

// ---------- About page ----------
// Pillars, presidents and the timeline stay in JSON (not in the sheet).
import pillarsData from '../data/pillars.json';
import presidentsData from '../data/presidents.json';
import timelineData from '../data/timeline.json';

export type OrgId = 'esa' | 'ees' | 'wec' | 'ode';

export interface PillarInfo { name: Pillar; color: string; line: string; examples: string[] }
export interface Achievement { org: OrgId; title: string; year?: string }
export interface President { org: OrgId; name: string; term?: string }
export interface Advisor { name: string; title: string; department: string }
export interface Milestone { when: string; text: string; org: OrgId }

export const pillars = pillarsData as PillarInfo[];
export const timeline = timelineData as Milestone[];
export const advisors = advisorsData as Advisor[];

// ---------- Leadership ----------

export type BoardGroup = 'Coordination' | 'Domain leads' | 'Directors';
export const boardGroups: BoardGroup[] = ['Coordination', 'Domain leads', 'Directors'];

export interface BoardMember {
  role: string;
  name: string; // empty until the board is announced
  year: string;
  major: string;
  photo?: string;
  bio?: string;
  linkedin?: string;
  group: BoardGroup;
}

export const board = boardData as BoardMember[];
export const boardHasNames = () => board.some((m) => (m.name ?? '').trim() !== '');

// ---------- Members (dues-paying) ----------

export interface Member {
  name: string;
  year?: string; // e.g. "Junior", "Grad student"
  through: string; // last semester their dues cover, e.g. "Spring 2027"
  permission: boolean; // only shown when true
}

/** "Fall 2026" → sortable number. Unknown text → NaN. */
function termIndex(term: string): number {
  const m = /^(Spring|Summer|Fall)\s+(\d{4})$/i.exec((term ?? '').trim());
  if (!m) return NaN;
  const order = { spring: 0, summer: 1, fall: 2 } as Record<string, number>;
  return Number(m[2]) * 3 + order[m[1].toLowerCase()];
}

/** The membership semester right now. Over the summer, spring members stay listed. */
export function currentTerm(): string {
  const s = semesterOf(todayInArizona());
  return s.startsWith('Summer') ? s.replace('Summer', 'Spring') : s;
}

/** Members who opted in and whose dues cover the current semester, A–Z. */
export function currentMembers(): Member[] {
  const now = termIndex(currentTerm());
  return (membersData as Member[])
    .filter((m) => m.permission === true && (m.name ?? '').trim() !== '' && termIndex(m.through) >= now)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const achievementsFor = (org: OrgId) =>
  (achievementsData as Achievement[]).filter((a) => a.org === org);
export const presidentsFor = (org: OrgId) =>
  (presidentsData as President[]).filter((p) => p.org === org);
