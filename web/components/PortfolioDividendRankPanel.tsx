import type { PortfolioDividendRank } from '@/lib/portfolio-dividend-rank';
import { DividendRankTable } from '@/components/DividendRankTable';

interface Props {
  data: PortfolioDividendRank;
}

function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function PortfolioDividendRankPanel({ data }: Props) {
  return (
    <section className="dividend-rank-section">
      <div className="section-head">
        <div>
          <h2>Dividend income — three lenses</h2>
          <p className="muted small">
            FY26 trailing dividend · as of {data.asOf} · {data.positionCount} holdings · Lists 1–2
            use YoC on <strong>deployed capital</strong>; List 3 uses live CMP
          </p>
        </div>
        <div className="dividend-rank-stats muted small">
          <span>Est. portfolio dividend ₹/yr: {formatInr(data.totalAnnualDivInr)}</span>
          {data.top10AbsoluteLowYocSharePct != null && (
            <span>
              Top-10 low-YoC ₹ names: ~{data.top10AbsoluteLowYocSharePct}% of dividend cash
            </span>
          )}
          {data.cmpCoveragePct != null && (
            <span>CMP available: {data.cmpCoveragePct}% of dividend names</span>
          )}
        </div>
      </div>

      <div className="dividend-rank-grid">
        <DividendRankTable
          tableId="yoc"
          title="Top 10 — Yield on Cost (YoC)"
          subtitle="Best income % on your deployed capital — primary lens for dividend names"
          rows={data.topByYoc}
          variant="yoc"
        />
        <DividendRankTable
          tableId="absolute"
          title="Top 10 — Highest ₹ dividend (YoC below 8%)"
          subtitle="Most cash in absolute ₹ despite low yield on cost — legacy quality book bonus"
          rows={data.topByAbsoluteLowYoc}
          variant="absolute"
        />
        <DividendRankTable
          tableId="cmp"
          title="Top 10 — Dividend yield @ CMP"
          subtitle="Best dividend on current market price — secondary lens; not used for add gate on existing holders"
          rows={data.topByCmpYield}
          variant="cmp"
        />
      </div>

      <ul className="dividend-rank-notes muted small">
        {data.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}
