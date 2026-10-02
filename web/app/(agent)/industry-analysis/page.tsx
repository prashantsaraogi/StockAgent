import Link from 'next/link';
import { loadSectorOutlookSummaries } from '@/lib/sector-outlook';
import { sectorViewFromScore, scoreTo100 } from '@/lib/sector-score-framework';
import { sectorSlugFromOutlookPath } from '@/lib/sector-slugs';
import { SectorCapTierCardLink } from '@/components/SectorCapTierPanel';
import { SectorScoreLegend } from '@/components/SectorScorePanel';

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
        <div className="sector-score-link-grid">
          {outlooks.map((o) => {
            const slug = sectorSlugFromOutlookPath(o.path);
            const view = sectorViewFromScore(o.score.weightedTotal);
            if (!slug) return null;
            return (
              <SectorCapTierCardLink
                key={o.path}
                slug={slug}
                label={o.label}
                score100={scoreTo100(o.score.weightedTotal)}
                viewLabel={view.label}
                viewEmoji={view.emoji}
                cssBand={view.cssBand}
              />
            );
          })}
        </div>
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
