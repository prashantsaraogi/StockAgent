import {
  SUMMARY_MD_BY_TICKER,
  FAQ_MD_BY_TICKER,
  APPROACH_MD_BY_TICKER,
} from './bundled/stockbook-tabs.generated';

export function getBundledSummaryMd(ticker: string): string | null {
  const key = ticker.toUpperCase();
  const md = SUMMARY_MD_BY_TICKER[key as keyof typeof SUMMARY_MD_BY_TICKER];
  return md ?? null;
}

export function getBundledFaqMd(ticker: string): string | null {
  const key = ticker.toUpperCase();
  const md = FAQ_MD_BY_TICKER[key as keyof typeof FAQ_MD_BY_TICKER];
  return md ?? null;
}

export function getBundledApproachMd(ticker: string): string | null {
  const key = ticker.toUpperCase();
  const md = APPROACH_MD_BY_TICKER[key as keyof typeof APPROACH_MD_BY_TICKER];
  return md ?? null;
}
