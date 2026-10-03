import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { NEWS_SUMMARIES_BY_DATE } from './bundled/news-summaries.generated';

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

function dayEntryFromMarkdown(date: string, md: string): NewsDayEntry {
  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return {
    date,
    year: parseInt(dateMatch![1], 10),
    month: parseInt(dateMatch![2], 10),
    day: parseInt(dateMatch![3], 10),
    title: extractTitle(md, `News — ${date}`),
    preview: extractPreview(md),
  };
}

function groupNewsDays(dayEntries: NewsDayEntry[]): NewsYearGroup[] {
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

/** Scan News/YYYY-MM/YYYY-MM-DD/summary.md — group Year → Month → Date. */
export async function listNewsArchive(): Promise<NewsYearGroup[]> {
  const dayEntries: NewsDayEntry[] = [];
  const seen = new Set<string>();

  const newsRoot = path.join(getRepoRoot(), 'News');
  if (await exists(newsRoot)) {
    const monthDirs = await fs.readdir(newsRoot, { withFileTypes: true });

    for (const monthDir of monthDirs) {
      if (!monthDir.isDirectory() || !/^\d{4}-\d{2}$/.test(monthDir.name)) continue;

      const monthPath = path.join(newsRoot, monthDir.name);
      const dayDirs = await fs.readdir(monthPath, { withFileTypes: true });

      for (const dayDir of dayDirs) {
        if (!dayDir.isDirectory()) continue;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dayDir.name)) continue;

        const summaryPath = path.join(monthPath, dayDir.name, 'summary.md');
        if (!(await exists(summaryPath))) continue;

        const md = await fs.readFile(summaryPath, 'utf8');
        seen.add(dayDir.name);
        dayEntries.push(dayEntryFromMarkdown(dayDir.name, md));
      }
    }
  }

  for (const [date, md] of Object.entries(NEWS_SUMMARIES_BY_DATE)) {
    if (seen.has(date) || !md?.trim()) continue;
    seen.add(date);
    dayEntries.push(dayEntryFromMarkdown(date, md));
  }

  if (dayEntries.length === 0) return [];
  return groupNewsDays(dayEntries);
}

export async function readNewsSummary(date: string): Promise<string | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const ym = date.slice(0, 7);
  const file = path.join(getRepoRoot(), 'News', ym, date, 'summary.md');
  if (await exists(file)) {
    return fs.readFile(file, 'utf8');
  }
  const bundled = NEWS_SUMMARIES_BY_DATE[date as keyof typeof NEWS_SUMMARIES_BY_DATE];
  return bundled ?? null;
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
