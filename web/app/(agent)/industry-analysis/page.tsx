import Link from 'next/link';
import { loadSectorOutlookSummaries } from '@/lib/sector-outlook';
import { SectorScoreCardLink, SectorScoreLegend } from '@/components/SectorScorePanel';

export default async function IndustryAnalysisPage() {
  const { outlooks, comparativeRanks } = await loadSectorOutlookSummaries();

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Industry Growth</h1>
        <p className="muted">
          Sector scorecard — ranked by 100-point score · connects sector growth → earnings → stock
          potential.
        </p>
      </header>

      <section className="sector-outlook-section">
        <div className="sector-outlook-head-row">
          <h2>Sectors</h2>
          <SectorScoreLegend />
        </div>
        {outlooks.length === 0 ? (
          <p className="muted">
            Sector outlook files are not available on this host. Run{' '}
            <code>npm run sync-bundled-docs</code> and redeploy, or open the app from the full repo.
          </p>
        ) : (
          <div className="sector-score-link-grid">
            {outlooks.map((o) => (
              <SectorScoreCardLink
                key={o.path}
                label={o.label}
                filePath={o.path}
                score={o.score}
                detailHref={`/industry-analysis/${o.slug}`}
              />
            ))}
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
