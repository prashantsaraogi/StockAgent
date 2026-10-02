import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';

export interface NewsDayEntry {
  date: string;
  year: number;
  month: number;
  day: number;
  title: string;
  preview: string;
}

export interface NewsMonthGroup {
  year: number;
  month: number;
  monthLabel: string;
  days: NewsDayEntry[];
}

export interface NewsYearGroup {
  year: number;
  months: NewsMonthGroup[];
  totalDays: number;
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function extractTitle(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim() ?? fallback;
}

function extractPreview(md: string): string {
  const lines = md.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  return lines.slice(0, 2).join(' ').slice(0, 160);
}

/** Scan News/YYYY-MM/YYYY-MM-DD/summary.md — group Year → Month → Date. */
export async function listNewsArchive(): Promise<NewsYearGroup[]> {
  const newsRoot = path.join(getRepoRoot(), 'News');
  if (!(await exists(newsRoot))) return [];

  const dayEntries: NewsDayEntry[] = [];
  const monthDirs = await fs.readdir(newsRoot, { withFileTypes: true });

  for (const monthDir of monthDirs) {
    if (!monthDir.isDirectory() || !/^\d{4}-\d{2}$/.test(monthDir.name)) continue;

    const [yearStr, monthStr] = monthDir.name.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const monthPath = path.join(newsRoot, monthDir.name);
    const dayDirs = await fs.readdir(monthPath, { withFileTypes: true });

    for (const dayDir of dayDirs) {
      if (!dayDir.isDirectory()) continue;
      const dateMatch = dayDir.name.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!dateMatch) continue;

      const summaryPath = path.join(monthPath, dayDir.name, 'summary.md');
      if (!(await exists(summaryPath))) continue;

      const md = await fs.readFile(summaryPath, 'utf8');
      dayEntries.push({
        date: dayDir.name,
        year: parseInt(dateMatch[1], 10),
        month: parseInt(dateMatch[2], 10),
        day: parseInt(dateMatch[3], 10),
        title: extractTitle(md, `News — ${dayDir.name}`),
        preview: extractPreview(md),
      });
    }
  }

  dayEntries.sort((a, b) => b.date.localeCompare(a.date));

  const byYear = new Map<number, Map<number, NewsDayEntry[]>>();
  for (const entry of dayEntries) {
    if (!byYear.has(entry.year)) byYear.set(entry.year, new Map());
    const byMonth = byYear.get(entry.year)!;
    if (!byMonth.has(entry.month)) byMonth.set(entry.month, []);
    byMonth.get(entry.month)!.push(entry);
  }

  const years: NewsYearGroup[] = [];
  for (const year of [...byYear.keys()].sort((a, b) => b - a)) {
    const monthMap = byYear.get(year)!;
    const months: NewsMonthGroup[] = [];

    for (const month of [...monthMap.keys()].sort((a, b) => b - a)) {
      const days = monthMap.get(month)!.sort((a, b) => b.date.localeCompare(a.date));
      months.push({
        year,
        month,
        monthLabel: monthLabel(year, month),
        days,
      });
    }

    years.push({
      year,
      months,
      totalDays: months.reduce((s, m) => s + m.days.length, 0),
    });
  }

  return years;
}

export async function readNewsSummary(date: string): Promise<string | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const ym = date.slice(0, 7);
  const file = path.join(getRepoRoot(), 'News', ym, date, 'summary.md');
  if (!(await exists(file))) return null;
  return fs.readFile(file, 'utf8');
}

export function newsDatePath(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `/journal/news/${year}/${mm}/${dd}`;
}

export function formatNewsDayLabel(entry: NewsDayEntry): string {
  return new Date(`${entry.date}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
