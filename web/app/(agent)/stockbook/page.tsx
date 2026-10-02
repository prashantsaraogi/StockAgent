import { redirect } from 'next/navigation';

/** Legacy URL — holdings list moved to Portfolio; history at Analysis Log. */
export default function StockbookRedirectPage() {
  redirect('/journal/analysis');
}
