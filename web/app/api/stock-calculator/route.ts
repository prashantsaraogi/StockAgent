import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { runStockCalculator, type PeBasis } from '@/lib/stock-calculator-engine';
import { saveCalculatorRecord } from '@/lib/stock-calculator-history';

function optionalPositiveNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Standalone stock calculator — no portfolio / holdings link. */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const stockQuery = String(body.stockQuery ?? body.stockName ?? '').trim();
    const ticker = body.ticker ? String(body.ticker).toUpperCase() : undefined;
    const peBasis = (body.peBasis === 'forward' ? 'forward' : 'ttm') as PeBasis;
    const expectedCagrPct = Number(body.expectedCagrPct ?? body.expectedCagr);
    const years = Number(body.years ?? 5);
    const manualPeOverride = optionalPositiveNumber(body.manualPeOverride);
    const investmentAmountInr = optionalPositiveNumber(body.investmentAmountInr);

    if (!stockQuery && !ticker) {
      return NextResponse.json({ ok: false, error: 'Stock name required' }, { status: 400 });
    }
    if (!Number.isFinite(expectedCagrPct)) {
      return NextResponse.json({ ok: false, error: 'Expected CAGR required' }, { status: 400 });
    }
    if (!Number.isFinite(years) || years < 1) {
      return NextResponse.json(
        { ok: false, error: 'Investment period must be ≥ 1 year' },
        { status: 400 }
      );
    }

    const result = await runStockCalculator({
      stockQuery: stockQuery || ticker!,
      ticker,
      peBasis,
      expectedCagrPct,
      years,
      manualPeOverride,
      investmentAmountInr,
    });

    const record = await saveCalculatorRecord({
      tenantId: session.tenantId,
      userId: session.userId,
      authMode: session.authMode,
      result,
    });

    return NextResponse.json({
      ok: true,
      record: {
        id: record.id,
        ticker: record.ticker,
        stockName: record.stockName,
        sector: record.sector,
        peBasis: record.peBasis,
        expectedCagrPct: record.expectedCagrPct,
        years: record.years,
        cmp: record.cmp,
        anchorPe: record.anchorPe,
        anchorEps: record.anchorEps,
        projectedEps: record.projectedEps,
        snapshot: record.snapshot,
        manualPeOverride: record.manualPeOverride,
        investmentAmountInr: record.investmentAmountInr,
        impliedVerdict: record.impliedVerdict,
        scenarios: record.scenarios,
        report: record.report,
        quality: record.quality,
        internalRisk: record.internalRisk,
        externalRisk: record.externalRisk,
        cagrGap: record.cagrGap,
        frameworkVerdict: record.frameworkVerdict,
        reportMode: record.reportMode,
        tabAnalysis: record.tabAnalysis,
      },
      detailPath: `/stock-calculator/${record.id}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
