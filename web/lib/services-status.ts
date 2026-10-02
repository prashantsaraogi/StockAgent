import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { listNewsArchive } from './news-archive';
import { parseMcapLastRefreshed } from './sector-mcap-refresh';
import { parseSectorScoreFromMarkdown } from './sector-score-parser';
import { SECTOR_OUTLOOK_PATHS } from './sector-slugs';
import { readCmpCacheStatus } from './cmp-stockbook-refresh';
import { currentExpectedQuarter, readBrokerAsOfDate } from './quarterly-results-scan';
import { readLastCronRun } from './cron-log';

export interface SectorMcapStatus {
  lastRefreshed: string | null;
  sectorsTotal: number;
  sectorsWithStamp: number;
  staleSectors: string[];
  /** Tickers that failed on last known refresh (if logged in any file — optional) */
}

export interface SectorScoresStatus {
  scoredCount: number;
  totalSectors: number;
  oldestAnalysisDate: string | null;
  newestAnalysisDate: string | null;
  nextRefreshDue: string | null;
  incompleteSectors: string[];
}

export interface LatestNewsStatus {
  latestDate: string | null;
  totalDays: number;
  latestTitle: string | null;
  daysSinceLatest: number | null;
}

export interface PortfolioCmpStatus {
  note: string;
}

export interface CmpCacheStatus {
  lastRefreshed: string | null;
  tickerCount: number;
  daysSinceRefresh: number | null;
  stale: boolean;
}

export interface QuarterResultsStatus {
  expectedQuarter: string;
  note: string;
}

export interface BrokerTargetsStatus {
  asOf: string | null;
  daysSinceRefresh: number | null;
  note: string;
}

export interface ScheduledRunStatus {
  lastRunAt: string | null;
  lastOk: boolean | null;
  lastSummary: string | null;
  lastTrigger: string | null;
  note: string;
}

export interface ServicesStatus {
  checkedAt: string;
  sectorMcap: SectorMcapStatus;
  sectorScores: SectorScoresStatus;
  latestNews: LatestNewsStatus;
  portfolioCmp: PortfolioCmpStatus;
  cmpCache: CmpCacheStatus;
  quarterResults: QuarterResultsStatus;
  brokerTargets: BrokerTargetsStatus;
  scheduledRun: ScheduledRunStatus;
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / (86400000));
}

function minDate(dates: (string | null)[]): string | null {
  const valid = dates.filter((d): d is string => !!d);
  if (valid.length === 0) return null;
  return valid.sort()[0];
}

function maxDate(dates: (string | null)[]): string | null {
  const valid = dates.filter((d): d is string => !!d);
  if (valid.length === 0) return null;
  return valid.sort().reverse()[0];
}

export async function loadServicesStatus(): Promise<ServicesStatus> {
  const today = new Date().toISOString().slice(0, 10);
  const repoRoot = getRepoRoot();

  const mcapDates: string[] = [];
  const staleSectors: string[] = [];
  const sectorLabels = Object.keys(SECTOR_OUTLOOK_PATHS);
  let sectorsWithStamp = 0;

  const scoreDates: string[] = [];
  const refreshDueDates: string[] = [];
  const incompleteSectors: string[] = [];
  let scoredCount = 0;

  for (const slug of sectorLabels) {
    const rel = SECTOR_OUTLOOK_PATHS[slug];
    const full = path.join(repoRoot, rel.replace(/\//g, path.sep));
    let md = '';
    try {
      md = await fs.readFile(full, 'utf8');
    } catch {
      incompleteSectors.push(slug);
      continue;
    }

    const mcapDate = parseMcapLastRefreshed(md);
    if (mcapDate) {
      sectorsWithStamp += 1;
      mcapDates.push(mcapDate);
      if (daysBetween(mcapDate, today) > 7) staleSectors.push(slug);
    } else {
      staleSectors.push(slug);
    }

    const score = parseSectorScoreFromMarkdown(md);
    if (score.complete && score.weightedTotal != null) scoredCount += 1;
    else incompleteSectors.push(slug);
    if (score.analysisDate) scoreDates.push(score.analysisDate);
    if (score.nextRefreshDue) refreshDueDates.push(score.nextRefreshDue);
  }

  const archive = await listNewsArchive();
  const totalDays = archive.reduce((s, y) => s + y.totalDays, 0);
  const latestDay = archive[0]?.months[0]?.days[0] ?? null;

  const cmpCache = await readCmpCacheStatus();
  const brokerAsOf = await readBrokerAsOfDate();
  const cmpDays = cmpCache.refreshedAt ? daysBetween(cmpCache.refreshedAt, today) : null;
  const brokerDays = brokerAsOf ? daysBetween(brokerAsOf, today) : null;
  const lastPack = await readLastCronRun('daily-market-pack');

  return {
    checkedAt: new Date().toISOString(),
    sectorMcap: {
      lastRefreshed: maxDate(mcapDates),
      sectorsTotal: sectorLabels.length,
      sectorsWithStamp,
      staleSectors,
    },
    sectorScores: {
      scoredCount,
      totalSectors: sectorLabels.length,
      oldestAnalysisDate: minDate(scoreDates),
      newestAnalysisDate: maxDate(scoreDates),
      nextRefreshDue: minDate(refreshDueDates),
      incompleteSectors: [...new Set(incompleteSectors)],
    },
    latestNews: {
      latestDate: latestDay?.date ?? null,
      totalDays,
      latestTitle: latestDay?.title ?? null,
      daysSinceLatest: latestDay ? daysBetween(latestDay.date, today) : null,
    },
    portfolioCmp: {
      note: 'Live NSE on Dashboard/Portfolio (5 min cache). Persist to StockBook via “Update CMP” service.',
    },
    cmpCache: {
      lastRefreshed: cmpCache.refreshedAt,
      tickerCount: cmpCache.tickerCount,
      daysSinceRefresh: cmpDays,
      stale: cmpDays == null || cmpDays > 1,
    },
    quarterResults: {
      expectedQuarter: currentExpectedQuarter(),
      note: 'Run scan daily during results season · AI refresh per flagged ticker.',
    },
    brokerTargets: {
      asOf: brokerAsOf,
      daysSinceRefresh: brokerDays,
      note: brokerAsOf
        ? `Portfolio broker summary as of ${brokerAsOf}`
        : 'No broker summary date — run broker refresh',
    },
    scheduledRun: {
      lastRunAt: lastPack?.finishedAt ?? null,
      lastOk: lastPack?.ok ?? null,
      lastSummary: lastPack?.summary ?? null,
      lastTrigger: lastPack?.trigger ?? null,
      note: lastPack
        ? `Last daily pack: ${lastPack.finishedAt.slice(0, 16).replace('T', ' ')} (${lastPack.trigger})`
        : 'Not run yet — register 8 AM task or npm run daily-market-pack',
    },
  };
}
