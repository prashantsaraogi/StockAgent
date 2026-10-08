import Link from 'next/link';
import { IndustrySectorGroupSection } from '@/components/IndustrySectorGroupSection';
import { SectorScoreCardLink, SectorScoreLegend } from '@/components/SectorScorePanel';
import { loadSectorOutlookSummaries } from '@/lib/sector-outlook';

export default async function IndustryAnalysisPage() {
  const { industryGroups, standaloneOutlooks, comparativeRanks } =
    await loadSectorOutlookSummaries();

  const hasContent = industryGroups.length > 0 || standaloneOutlooks.length > 0;

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Industry Growth</h1>
        <p className="muted">
          Major industry clusters and sub-sector scorecards — 100-point framework · cap-tier
          universes · links to surplus comparative ranks below.
        </p>
      </header>

      <section className="sector-outlook-section">
        <div className="sector-outlook-head-row">
          <h2>Industry clusters</h2>
          <SectorScoreLegend />
        </div>
        {!hasContent ? (
          <p className="muted">
            Sector outlook files are not available on this host. Run{' '}
            <code>npm run sync-bundled-docs</code> and redeploy, or open the app from the full repo.
          </p>
        ) : (
          <div className="industry-clusters-stack">
            {industryGroups.map((group) => (
              <IndustrySectorGroupSection key={group.def.id} group={group} />
            ))}

            {standaloneOutlooks.length > 0 && (
              <section className="industry-sector-group industry-standalone-outlooks">
                <h3 className="industry-sector-group-title">Additional outlooks</h3>
                <p className="muted small industry-sector-group-intro">
                  Not yet assigned to a cluster — add to{' '}
                  <code>industry-sector-groups.ts</code> when grouping is defined.
                </p>
                <div className="sector-score-link-grid industry-sector-group-grid">
                  {standaloneOutlooks.map((o) => (
                    <SectorScoreCardLink
                      key={o.path}
                      label={o.label}
                      filePath={o.path}
                      score={o.score}
                      detailHref={`/industry-analysis/${o.slug}`}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      {comparativeRanks.length > 0 && (
        <section className="card wide mt-section">
          <h2>Comparative ranks (surplus deployment)</h2>
          <p className="muted small">
            Fresh-capital rank today — separate from 3–5Y sector score.
          </p>
          <ul className="nav-list sector-rank-links">
            {comparativeRanks.map((f) => (
              <li key={f.path}>
                <Link href={`/industry-analysis/view?file=${encodeURIComponent(f.path)}`}>
                  {f.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
