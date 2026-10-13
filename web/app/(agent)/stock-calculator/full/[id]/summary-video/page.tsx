import { requireSession } from '@/lib/auth';
import { SummaryVideoDetailLoader } from '@/components/SummaryVideoDetailLoader';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ record?: string }>;
}

export default async function AnalysisSummaryVideoPage({ params, searchParams }: Props) {
  await requireSession();
  const { id } = await params;
  const { record: recordParam } = await searchParams;
  const recordMode = recordParam === '1' || recordParam === 'true';

  return <SummaryVideoDetailLoader recordId={id} recordMode={recordMode} />;
}
