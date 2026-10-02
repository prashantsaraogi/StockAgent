import type { CmpSource } from './nse-cmp';

export type { CmpSource };

export function cmpSourceLabel(source: CmpSource | null): string {
  switch (source) {
    case 'nse':
      return 'NSE India (live)';
    case 'nse-yahoo':
      return 'NSE LTP (Yahoo .NS mirror)';
    case 'stockbook':
      return 'StockBook (stale fallback)';
    default:
      return 'Unavailable';
  }
}
