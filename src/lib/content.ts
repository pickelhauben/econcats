// Read content from src/data. In step 4 these functions will fetch the
// Website Content Google Sheet (CSV) instead; pages should only use these helpers.
import events from '../data/events.json';
import projects from '../data/projects.json';
import supporters from '../data/supporters.json';

export type Pillar = 'Connect' | 'Grow' | 'Access';

export interface EventItem {
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  location: string;
  tag: Pillar;
  draft?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  tag: Pillar;
  featured?: boolean;
}

export interface Supporter {
  name: string;
  note?: string;
  permission: boolean;
}

// Rows marked "draft" show in `npm run dev` only, never in the built site.
const visible = <T extends { draft?: boolean }>(rows: T[]) =>
  rows.filter((r) => !r.draft || import.meta.env.DEV);

export function upcomingEvents(limit = 3): EventItem[] {
  const today = new Date().toISOString().slice(0, 10);
  return visible(events as EventItem[])
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function featuredProjects(limit = 3): Project[] {
  return (projects as Project[]).filter((p) => p.featured).slice(0, limit);
}

export function publicSupporters(limit = 6): Supporter[] {
  return (supporters as Supporter[]).filter((s) => s.permission).slice(0, limit);
}
