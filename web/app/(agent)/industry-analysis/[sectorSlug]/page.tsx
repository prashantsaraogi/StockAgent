import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readRepoMarkdown } from '@/lib/content';
import { parseCapTierUniverseFromMarkdown } from '@/lib/sector-cap-universe-parser';
import { parseMcapLastRefreshed } from '@/lib/sector-mcap-refresh';
import { parseSectorScoreFromMarkdown } from '@/lib/sector-score-parser';
import { industryDetailBackNavigation } from '@/lib/industry-sector-groups';
import { outlookPathFromSlug, sectorLabelFromSlug } from '@/lib/sector-slugs';
import { SectorCapTierPanel } from '@/components/SectorCapTierPanel';
import { SectorScorePanel } from '@/components/SectorScorePanel';

interface Props {
  params: Promise<{ sectorSlug: string }>;
}

export default async function SectorDetailPage({ params }: Props) {
  const { sectorSlug } = await params;
  const filePath = outlookPathFromSlug(sectorSlug);
  if (!filePath) notFound();

  const content = await readRepoMarkdown(filePath);
  if (!content) notFound();

  const title = sectorLabelFromSlug(sectorSlug);
  const score = parseSectorScoreFromMarkdown(content);
  const capUniverse = parseCapTierUniverseFromMarkdown(content);
  const mcapLastRefreshed = parseMcapLastRefreshed(content);

  const { href: backHref, label: backLabel } = industryDetailBackNavigation(sectorSlug);

  return (
    <div className="page page-prose">
      <Link href={backHref} className="back-link">
        {backLabel}
      </Link>
      <header className="page-header">
        <h1>{title}</h1>
        <p className="muted">Sector score + cap tier stock universe (Growth vs Market cap)</p>
      </header>

      <SectorScorePanel
        sectorLabel={title}
        filePath={filePath}
        score={score}
        compact
      />

      <SectorCapTierPanel
        tiers={capUniverse.tiers}
        complete={capUniverse.complete}
        mcapLastRefreshed={mcapLastRefreshed}
      />
    </div>
  );
}
