import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readRepoMarkdown } from '@/lib/content';
import {
  parseSectorScoreFromMarkdown,
  sectorDisplayLabel,
} from '@/lib/sector-score-parser';
import { ProseContent } from '@/components/ProsePanel';
import { SectorScorePanel } from '@/components/SectorScorePanel';

interface Props {
  searchParams: Promise<{ file?: string }>;
}

export default async function IndustryViewPage({ searchParams }: Props) {
  const { file } = await searchParams;
  if (!file || !file.startsWith('StockBook/') || file.includes('..')) notFound();

  const content = await readRepoMarkdown(file);
  if (!content) notFound();

  const isOutlook = file.includes('-sector-outlook.md');
  const title = sectorDisplayLabel(file);
  const score = isOutlook ? parseSectorScoreFromMarkdown(content) : null;

  return (
    <div className="page page-prose">
      <Link href="/industry-analysis" className="back-link">
        ← Industry Growth
      </Link>
      <header className="page-header">
        <h1>{title}</h1>
        {isOutlook && (
          <p className="muted">Sector score (output) + 3–5Y forward outlook</p>
        )}
      </header>

      {score && (
        <SectorScorePanel sectorLabel={title} filePath={file} score={score} />
      )}

      <ProseContent content={content} badge={file} title={score ? 'Full outlook' : undefined} />
    </div>
  );
}
