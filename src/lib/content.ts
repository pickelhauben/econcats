// Read content from src/data. In step 4 these functions will fetch the
// Website Content Google Sheet (CSV) instead; pages should only use these helpers.
import events from '../data/events.json';
import projects from '../data/projects.json';
import supporters from '../data/supporters.json';

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
  photos?: string[]; // image paths
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

export interface Supporter {
  name: string;
  note?: string;
  permission: boolean;
}

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
  return (supporters as Supporter[]).filter((s) => s.permission).slice(0, limit);
}

// ---------- About page ----------
import pillarsData from '../data/pillars.json';
import achievementsData from '../data/achievements.json';
import presidentsData from '../data/presidents.json';
import advisorsData from '../data/advisors.json';
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
import boardData from '../data/board.json';

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
export const boardHasNames = () => board.some((m) => m.name.trim() !== '');

export const achievementsFor = (org: OrgId) =>
  (achievementsData as Achievement[]).filter((a) => a.org === org);
export const presidentsFor = (org: OrgId) =>
  (presidentsData as President[]).filter((p) => p.org === org);
