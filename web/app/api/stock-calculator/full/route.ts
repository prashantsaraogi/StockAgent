import { NextResponse } from 'next/server';
import { getSession, portfolioLotContext } from '@/lib/auth';
import { runFullStockCalculatorAnalysis } from '@/lib/stock-calculator-full';
import { saveFullAnalysisRecord } from '@/lib/stock-calculator-full-history';
import type { PeBasis } from '@/lib/stock-calculator-engine';

function optionalPositiveNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Run all Stock Calculator modules for one ticker. */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const stockQuery = String(body.stockQuery ?? body.stockName ?? body.ticker ?? '').trim();
    const ticker = body.ticker ? String(body.ticker).toUpperCase() : undefined;
    const peBasis = (body.peBasis === 'forward' ? 'forward' : 'ttm') as PeBasis;
    const expectedCagrPct = Number(body.expectedCagrPct ?? body.expectedCagr ?? 12);
    const years = Number(body.years ?? 5);
    const manualPeOverride = optionalPositiveNumber(body.manualPeOverride);
    const investmentAmountInr = optionalPositiveNumber(body.investmentAmountInr);
    const purchasePrice = optionalPositiveNumber(body.purchasePrice);
    const purchaseDate = body.purchaseDate ? String(body.purchaseDate) : null;
    const refreshRecordId =
      typeof body.refreshRecordId === 'string' && body.refreshRecordId.length > 0
        ? body.refreshRecordId
        : undefined;
    const basicAnalysis =
      body.analysisMode !== 'advanced' && body.basicAnalysis !== false;

    if (!stockQuery && !ticker) {
      return NextResponse.json({ ok: false, error: 'Stock name required' }, { status: 400 });
    }
    if (!Number.isFinite(expectedCagrPct)) {
      return NextResponse.json({ ok: false, error: 'Expected CAGR required' }, { status: 400 });
    }
    if (!Number.isFinite(years) || years < 1) {
      return NextResponse.json({ ok: false, error: 'Investment period must be ≥ 1 year' }, { status: 400 });
    }

    const analysis = await runFullStockCalculatorAnalysis({
      ticker: ticker ?? stockQuery,
      tenantId: session.tenantId,
      peBasis,
      expectedCagrPct,
      years,
      manualPeOverride,
      investmentAmountInr,
      purchasePrice,
      purchaseDate,
      basicAnalysis,
      portfolioLotContext: portfolioLotContext(session),
    });

    if (!analysis) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Stock not found — enter a valid NSE ticker or company name (e.g. Nuvama Wealth or NUVAMA).',
        },
        { status: 404 }
      );
    }

    const { record, persisted } = await saveFullAnalysisRecord({
      tenantId: session.tenantId,
      userId: session.userId,
      authMode: session.authMode,
      analysis,
      refreshRecordId,
    });

    return NextResponse.json({
      ok: true,
      analysis,
      record: {
        id: record.id,
        createdAt: record.createdAt,
        ticker: record.ticker,
        stockName: record.stockName,
        childIds: record.childIds,
      },
      detailPath: `/stock-calculator/full/${record.id}`,
      historyPersisted: persisted,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
