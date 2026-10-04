import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import {
  getBundledComparativeRankMd,
  getBundledSectorOutlookMd,
} from './load-bundled-sector-outlook';
import { getUserPaths } from './tenant';
import { toSlug } from './navigation';
import { STOCKBOOK_TABS, type StockbookTabId } from './navigation';

export interface StockEntry {
  sector: string;
  stock: string;
  sectorSlug: string;
  stockSlug: string;
  ticker?: string;
  hasFiles: boolean;
  holdingsSector?: string;
  qty?: number;
  avgCost?: number;
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function scanStockbookDir(baseDir: string, map: Map<string, StockEntry>): Promise<void> {
  if (!(await exists(baseDir))) return;
  const sectors = await fs.readdir(baseDir, { withFileTypes: true });
  for (const s of sectors) {
    if (!s.isDirectory() || s.name.startsWith('.')) continue;
    const sector = s.name;
    const sectorPath = path.join(baseDir, sector);
    const stocks = await fs.readdir(sectorPath, { withFileTypes: true });
    for (const st of stocks) {
      if (!st.isDirectory()) continue;
      const stock = st.name;
      const key = `${sector}/${stock}`;
      if (!map.has(key)) {
        map.set(key, {
          sector,
          stock,
          sectorSlug: toSlug(sector),
          stockSlug: toSlug(stock),
          hasFiles: true,
        });
      } else {
        map.get(key)!.hasFiles = true;
      }
    }
  }
}

/** List stocks from dev holdings + dev tenant stockbook + root StockBook (read-only browse) */
export async function listStockEntries(tenantId = 'dev'): Promise<StockEntry[]> {
  const { stockbookDir, holdingsFile } = getUserPaths(tenantId);
  const map = new Map<string, StockEntry>();

  await scanStockbookDir(stockbookDir, map);
  await scanStockbookDir(path.join(getRepoRoot(), 'StockBook'), map);

  if (await exists(holdingsFile)) {
    const md = await fs.readFile(holdingsFile, 'utf8');
    const rows = [
      ...md.matchAll(
        /\|\s*\d+\s*\|\s*(\w+)\s*\|\s*([^|]+)\|\s*[^|]+\|\s*[^|]+\|\s*[^|]+\|\s*([^|]+)\|/g
      ),
    ];
    for (const m of rows) {
      const ticker = m[1].trim();
      const company = m[2].trim();
      const sector = m[3].trim();
      const key = `${sector}/${company}`;
      if (!map.has(key)) {
        map.set(key, {
          sector,
          stock: company,
          sectorSlug: toSlug(sector),
          stockSlug: toSlug(company),
          ticker,
          hasFiles: false,
        });
      } else {
        map.get(key)!.ticker = ticker;
      }
    }
  }

  return [...map.values()].sort(
    (a, b) => a.sector.localeCompare(b.sector) || a.stock.localeCompare(b.stock)
  );
}

export async function resolveStockFromSlugs(
  sectorSlug: string,
  stockSlug: string,
  tenantId = 'dev'
): Promise<StockEntry | null> {
  const { listPortfolioHoldings } = await import('./holdings');
  const entries = await listPortfolioHoldings(tenantId);
  return (
    entries.find((e) => e.sectorSlug === sectorSlug && e.stockSlug === stockSlug) ?? null
  );
}

async function findFileByPattern(dir: string, pattern: string): Promise<string | null> {
  const files = await fs.readdir(dir);
  if (pattern.includes('*')) {
    const prefix = pattern.split('*')[0];
    const suffix = pattern.split('*').pop() ?? '';
    const hit = files.find((f) => f.startsWith(prefix) && f.endsWith(suffix));
    return hit ? path.join(dir, hit) : null;
  }
  const full = path.join(dir, pattern);
  return (await exists(full)) ? full : null;
}

export async function readStockTabContent(
  sector: string,
  stock: string,
  tabId: StockbookTabId,
  tenantId = 'dev'
): Promise<{ content: string; filename: string; type: 'md' | 'html' } | null> {
  const tab = STOCKBOOK_TABS.find((t) => t.id === tabId);
  if (!tab) return null;

  const dirs = [
    path.join(getUserPaths(tenantId).stockbookDir, sector, stock),
    path.join(getRepoRoot(), 'StockBook', sector, stock),
  ];

  let filePath: string | null = null;
  let type: 'md' | 'html' = 'md';

  for (const dir of dirs) {
    if (!(await exists(dir))) continue;
    if ('file' in tab && tab.file) {
      const candidate = path.join(dir, tab.file);
      if (await exists(candidate)) {
        filePath = candidate;
        break;
      }
    } else if ('filePattern' in tab && tab.filePattern) {
      filePath = await findFileByPattern(dir, tab.filePattern);
      if (tabId === 'report') type = 'html';
      if (filePath) break;
    }
  }

  if (!filePath) return null;
  const content = await fs.readFile(filePath, 'utf8');
  return { content, filename: path.basename(filePath), type };
}

export async function readRepoMarkdown(relativePath: string): Promise<string | null> {
  const roots = [
    getRepoRoot(),
    process.cwd(),
    path.resolve(process.cwd(), '..'),
  ];
  const tried = new Set<string>();
  for (const root of roots) {
    const full = path.normalize(path.join(root, relativePath));
    if (tried.has(full)) continue;
    tried.add(full);
    if (await exists(full)) return fs.readFile(full, 'utf8');
  }
  return (
    getBundledSectorOutlookMd(relativePath) ??
    getBundledComparativeRankMd(relativePath) ??
    null
  );
}

export async function listSectorOutlookFiles(): Promise<{ name: string; path: string; label: string }[]> {
  const dir = path.join(getRepoRoot(), 'StockBook');
  const out: { name: string; path: string; label: string }[] = [];

  async function walk(sub: string): Promise<void> {
    const current = path.join(dir, sub);
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const rel = sub ? `${sub}/${e.name}` : e.name;
      if (e.isDirectory()) {
        await walk(rel);
      } else if (
        e.name.endsWith('-sector-outlook.md') ||
        e.name.endsWith('-comparative-rank.md')
      ) {
        out.push({
          name: e.name.replace('.md', ''),
          path: path.join('StockBook', rel).replace(/\\/g, '/'),
          label: e.name.replace('.md', '').replace(/-/g, ' '),
        });
      }
    }
  }

  await walk('');
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export async function getLatestNewsSummary(): Promise<string | null> {
  const newsRoot = path.join(getRepoRoot(), 'News');
  // Walk recent months — simplified: try 2026-09 then 2026-08
  for (const month of ['2026-09', '2026-08']) {
    const monthDir = path.join(newsRoot, month);
    if (!(await exists(monthDir))) continue;
    const days = (await fs.readdir(monthDir)).sort().reverse();
    for (const day of days) {
      const summary = path.join(monthDir, day, 'summary.md');
      if (await exists(summary)) {
        return fs.readFile(summary, 'utf8');
      }
    }
  }
  return null;
}
