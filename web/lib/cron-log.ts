import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';

export type CronTrigger = 'cron-api' | 'cli' | 'manual' | 'services-ui';

export interface CronRunLog {
  action: string;
  trigger: CronTrigger;
  startedAt: string;
  finishedAt: string;
  ok: boolean;
  summary: string;
  steps?: { action: string; ok: boolean; summary: string; error?: string }[];
  error?: string;
}

interface CronLogFile {
  version: 1;
  runs: Record<string, CronRunLog>;
  history: CronRunLog[];
}

const MAX_HISTORY = 30;

function logPath(): string {
  return path.join(getRepoRoot(), 'data/cron/last-runs.json');
}

async function readLogFile(): Promise<CronLogFile> {
  try {
    const raw = await fs.readFile(logPath(), 'utf8');
    const parsed = JSON.parse(raw) as CronLogFile;
    if (parsed?.version === 1) return parsed;
  } catch {
    /* seed */
  }
  return { version: 1, runs: {}, history: [] };
}

export async function writeCronRunLog(entry: CronRunLog): Promise<void> {
  const file = logPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const data = await readLogFile();
  data.runs[entry.action] = entry;
  data.history = [entry, ...data.history.filter((h) => h.startedAt !== entry.startedAt)].slice(
    0,
    MAX_HISTORY
  );
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

export async function readLastCronRun(action: string): Promise<CronRunLog | null> {
  const data = await readLogFile();
  return data.runs[action] ?? null;
}
