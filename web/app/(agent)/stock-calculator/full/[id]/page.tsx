import { requireSession } from '@/lib/auth';
import { FullAnalysisDetailLoader } from '@/components/FullAnalysisDetailLoader';
import type { FullResultTabId } from '@/components/StockCalculatorFullResults';

const VALID_TABS = new Set<FullResultTabId>([
  'report',
  'overview',
  'cagr',
  'pe',
  'earnings-quality',
  'margin',
  'business-quality',
  'risk',
]);

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function FullAnalysisDetailPage({ params, searchParams }: Props) {
  await requireSession();
  const { id } = await params;
  const { tab } = await searchParams;
  const tabNorm = tab === 'framework' ? 'report' : tab;
  const initialTab =
    tabNorm && VALID_TABS.has(tabNorm as FullResultTabId)
      ? (tabNorm as FullResultTabId)
      : undefined;

  return <FullAnalysisDetailLoader recordId={id} initialTab={initialTab} />;
}
