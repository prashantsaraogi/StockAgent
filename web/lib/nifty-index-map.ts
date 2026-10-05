/** Nifty sector / thematic indices (Yahoo Finance symbols). */

export interface NiftyIndexRef {
  id: string;
  label: string;
  yahooSymbol: string;
}

export const NIFTY_50: NiftyIndexRef = {
  id: 'nifty50',
  label: 'Nifty 50',
  yahooSymbol: '^NSEI',
};

const INDEX_BY_KEY: Record<string, NiftyIndexRef> = {
  banks: { id: 'bank', label: 'Nifty Bank', yahooSymbol: '^NSEBANK' },
  it: { id: 'it', label: 'Nifty IT', yahooSymbol: '^CNXIT' },
  auto: { id: 'auto', label: 'Nifty Auto', yahooSymbol: '^CNXAUTO' },
  fmcg: { id: 'fmcg', label: 'Nifty FMCG', yahooSymbol: '^CNXFMCG' },
  pharma: { id: 'pharma', label: 'Nifty Pharma', yahooSymbol: '^CNXPHARMA' },
  healthcare: { id: 'pharma', label: 'Nifty Pharma', yahooSymbol: '^CNXPHARMA' },
  oil: { id: 'energy', label: 'Nifty Energy', yahooSymbol: '^CNXENERGY' },
  omc: { id: 'energy', label: 'Nifty Energy', yahooSymbol: '^CNXENERGY' },
  gas: { id: 'energy', label: 'Nifty Energy', yahooSymbol: '^CNXENERGY' },
  infra: { id: 'infra', label: 'Nifty Infra', yahooSymbol: '^CNXINFRA' },
  financials: { id: 'fin', label: 'Nifty Financial Services', yahooSymbol: '^CNXFIN' },
  insurance: { id: 'fin', label: 'Nifty Financial Services', yahooSymbol: '^CNXFIN' },
  nbfc: { id: 'fin', label: 'Nifty Financial Services', yahooSymbol: '^CNXFIN' },
  telecom: { id: 'nifty50', label: 'Nifty 50', yahooSymbol: '^NSEI' },
  consumer: { id: 'fmcg', label: 'Nifty FMCG', yahooSymbol: '^CNXFMCG' },
  hotels: { id: 'nifty50', label: 'Nifty 50', yahooSymbol: '^NSEI' },
  leisure: { id: 'nifty50', label: 'Nifty 50', yahooSymbol: '^NSEI' },
  gaming: { id: 'nifty50', label: 'Nifty 50', yahooSymbol: '^NSEI' },
  industrials: { id: 'nifty50', label: 'Nifty 50', yahooSymbol: '^NSEI' },
};

/** Map portfolio sector tag → benchmark index for variation columns. */
export function niftyIndexForSector(sector: string): NiftyIndexRef {
  const s = sector.toLowerCase();
  for (const [key, ref] of Object.entries(INDEX_BY_KEY)) {
    if (s.includes(key)) return ref;
  }
  return NIFTY_50;
}
