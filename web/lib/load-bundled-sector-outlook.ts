import {
  COMPARATIVE_RANK_MD_BY_PATH,
  SECTOR_OUTLOOK_MD_BY_PATH,
} from './bundled/sector-outlook.generated';

/** Bundled at build — used when StockBook is not on disk (Vercel). */
export function getBundledSectorOutlookMd(relativePath: string): string | null {
  const key = relativePath.replace(/\\/g, '/');
  const md = SECTOR_OUTLOOK_MD_BY_PATH[key as keyof typeof SECTOR_OUTLOOK_MD_BY_PATH];
  return md ?? null;
}

export function getBundledComparativeRankMd(relativePath: string): string | null {
  const key = relativePath.replace(/\\/g, '/');
  const md = COMPARATIVE_RANK_MD_BY_PATH[key as keyof typeof COMPARATIVE_RANK_MD_BY_PATH];
  return md ?? null;
}

export function listBundledComparativeRankPaths(): string[] {
  return Object.keys(COMPARATIVE_RANK_MD_BY_PATH);
}
