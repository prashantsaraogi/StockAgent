import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class UnsafeNewsWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeNewsWriteError';
  }
}

/** Resolve summary.md path — only News/YYYY-MM/YYYY-MM-DD/summary.md allowed. */
export function newsSummaryPath(date: string): string {
  if (!DATE_RE.test(date)) {
    throw new UnsafeNewsWriteError(`Invalid news date: ${date}`);
  }
  const ym = date.slice(0, 7);
  return path.join(getRepoRoot(), 'News', ym, date, 'summary.md');
}

export function assertSafeNewsWritePath(filePath: string): void {
  const root = getRepoRoot();
  const resolved = path.resolve(filePath);
  const newsRoot = path.join(root, 'News');
  if (!resolved.startsWith(newsRoot + path.sep) && resolved !== newsRoot) {
    throw new UnsafeNewsWriteError(`Write blocked outside News/: ${resolved}`);
  }
  const relative = path.relative(newsRoot, resolved).replace(/\\/g, '/');
  if (!/^\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\/summary\.md$/.test(relative)) {
    throw new UnsafeNewsWriteError(
      `Write blocked: only News/YYYY-MM/YYYY-MM-DD/summary.md allowed (got ${relative})`
    );
  }
}

export async function writeNewsSummary(date: string, content: string): Promise<string> {
  const fullPath = newsSummaryPath(date);
  assertSafeNewsWritePath(fullPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf8');
  return fullPath;
}

export async function readNewsSummaryFile(date: string): Promise<string | null> {
  try {
    const fullPath = newsSummaryPath(date);
    return await fs.readFile(fullPath, 'utf8');
  } catch {
    return null;
  }
}

/** Parse news date from user message (IST calendar). Defaults year to current IST year. */
export function parseNewsDateFromQuery(query: string, now = new Date()): string | null {
  const q = query.trim();

  const iso = q.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const defaultYear = istNow.getFullYear();

  const months: Record<string, number> = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
  };

  const dmy = q.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(20\d{2}))?\b/i
  );
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const monthKey = dmy[2].toLowerCase();
    const month = months[monthKey];
    const year = dmy[3] ? parseInt(dmy[3], 10) : defaultYear;
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const mdy = q.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(20\d{2}))?\b/i
  );
  if (mdy) {
    const monthKey = mdy[1].toLowerCase();
    const month = months[monthKey];
    const day = parseInt(mdy[2], 10);
    const year = mdy[3] ? parseInt(mdy[3], 10) : defaultYear;
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  if (/\b(today|run news|news for today|daily news)\b/i.test(q)) {
    const y = istNow.getFullYear();
    const m = String(istNow.getMonth() + 1).padStart(2, '0');
    const d = String(istNow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

export function isNewsWriteIntent(query: string): boolean {
  const q = query.toLowerCase();
  if (parseNewsDateFromQuery(query)) {
    if (/news|summary|headline|run news|add news|write news|daily|morning run/i.test(q)) {
      return true;
    }
  }
  return (
    /\b(run|add|write|create|update|save)\b.*\bnews\b/i.test(q) ||
    /\bnews\b.*\b(summary|for today|for \d|for september|for sep)\b/i.test(q) ||
    /\bdaily news\b/i.test(q) ||
    /\bmorning run\b/i.test(q)
  );
}

export function newsWebPath(date: string): string {
  const [y, m, d] = date.split('-');
  return `/journal/news/${y}/${m}/${d}`;
}
