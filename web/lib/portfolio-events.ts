/** Fired when lots are added, edited, or removed — refresh Portfolio reports. */
export const PORTFOLIO_HOLDINGS_CHANGED = 'portfolio-holdings-changed';

export function notifyPortfolioHoldingsChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PORTFOLIO_HOLDINGS_CHANGED));
  }
}
