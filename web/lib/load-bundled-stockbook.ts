import {
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
