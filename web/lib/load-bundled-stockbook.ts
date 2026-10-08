import {
  EARNINGS_QUALITY_MD_BY_TICKER,
  MARGIN_MD_BY_TICKER,
  PARAMETERS_MD_BY_TICKER,
  PEG_MD_BY_TICKER,
} from './bundled/stockbook-parameters.generated';

export function getBundledParametersMd(ticker: string): string | null {
  const key = ticker.toUpperCase();
  const md = PARAMETERS_MD_BY_TICKER[key as keyof typeof PARAMETERS_MD_BY_TICKER];
  return md ?? null;
}

export function getBundledPegMd(ticker: string): string | null {
  const key = ticker.toUpperCase();
  const md = PEG_MD_BY_TICKER[key as keyof typeof PEG_MD_BY_TICKER];
  return md ?? null;
}

export function getBundledMarginMd(ticker: string): string | null {
  const key = ticker.toUpperCase();
  const md = MARGIN_MD_BY_TICKER[key as keyof typeof MARGIN_MD_BY_TICKER];
  return md ?? null;
}

export function getBundledEarningsQualityMd(ticker: string): string | null {
  const key = ticker.toUpperCase();
  const md = EARNINGS_QUALITY_MD_BY_TICKER[key as keyof typeof EARNINGS_QUALITY_MD_BY_TICKER];
  return md ?? null;
}
