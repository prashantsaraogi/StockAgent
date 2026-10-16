/** Public reference sites for cross-checking stock parameters (not scraped — open in browser). */

const VRO_STOCKS_HOME = 'https://www.valueresearchonline.com/stocks/';
const MC_HOME = 'https://www.moneycontrol.com/';

export interface ExternalStockReferenceLinks {
  valueResearchHome: string;
  moneycontrolHome: string;
  /** VRO site search — each company has a numeric slug; search by name/ticker. */
  valueResearchSearch: string;
  /** Moneycontrol quote pages vary by slug — search by ticker + name. */
  moneycontrolSearch: string;
}

export function buildExternalStockReferenceLinks(
  ticker: string,
  stockName: string
): ExternalStockReferenceLinks {
  const qVro = `${stockName} ${ticker}`.trim();
  const qMc = `${ticker} ${stockName} stock price`.trim();
  return {
    valueResearchHome: VRO_STOCKS_HOME,
    moneycontrolHome: MC_HOME,
    valueResearchSearch: `https://www.valueresearchonline.com/stocks/?search=${encodeURIComponent(qVro)}`,
    moneycontrolSearch: `https://www.google.com/search?q=${encodeURIComponent(`site:moneycontrol.com ${qMc}`)}`,
  };
}
