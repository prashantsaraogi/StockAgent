import type { BusinessQualityResult, MoatPillar } from './business-quality-moat';
import { formatAnalysisDataSource, sanitizeMoatLine } from './investor-report-format';

function polishPillar(p: MoatPillar): MoatPillar {
  return {
    ...p,
    headline: sanitizeMoatLine(p.headline),
    factors: p.factors.map((f) => ({
      ...f,
      label: sanitizeMoatLine(f.label),
      assessment: sanitizeMoatLine(f.assessment),
    })),
  };
}

/** Web/API only — StockBook engine keeps internal proxy strings. */
export function toInvestorFacingBusinessQuality(
  result: BusinessQualityResult
): BusinessQualityResult {
  return {
    ...result,
    dataSource: formatAnalysisDataSource(result.dataSource),
    businessQualityFile: null,
    parametersFile: null,
    cmpSource: sanitizeMoatLine(result.cmpSource),
    pillars: result.pillars.map(polishPillar),
    highlights: result.highlights.map((h) => ({
      ...h,
      assessment: sanitizeMoatLine(h.assessment),
    })),
    summaryLines: result.summaryLines.map((line) => sanitizeMoatLine(line)),
    notTenReasons: result.notTenReasons.map((line) => sanitizeMoatLine(line)),
    ceilingNote: result.ceilingNote ? sanitizeMoatLine(result.ceilingNote) : null,
  };
}
