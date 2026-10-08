import type { IndustryGroupViewModel } from '@/lib/sector-outlook';
import { SectorScoreCardLink } from '@/components/SectorScorePanel';

interface Props {
  group: IndustryGroupViewModel;
}

export function IndustrySectorGroupSection({ group }: Props) {
  const { def, cards } = group;
  if (cards.length === 0) return null;

  return (
    <section
      id={def.id}
      className="industry-sector-group"
      aria-labelledby={`${def.id}-heading`}
    >
      <div className="industry-sector-group-head">
        <h3 id={`${def.id}-heading`} className="industry-sector-group-title">
          {def.title}
        </h3>
        {group.bestScore100 != null && (
          <span className="industry-sector-group-best muted small">
            Best sub-score{' '}
            <strong>{group.bestScore100}</strong>
            /100
          </span>
        )}
      </div>
      <p className="muted small industry-sector-group-intro">{def.intro}</p>
      <div className="sector-score-link-grid industry-sector-group-grid">
        {cards.map((o) => (
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
  );
}
