import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { loadPeEvaluation } from '@/lib/pe-evaluation';
import { runPeEvaluationScorecard } from '@/lib/pe-evaluation-scorecard';
import { savePeEvaluationRecord } from '@/lib/pe-evaluation-history';

function parsePurchaseDate(value: string): string | null {
  const s = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  if (d > new Date()) return null;
  return s;
}

/** PARAMETERS-based PE evaluation for Stock Calculator PE tab. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ticker = String(searchParams.get('ticker') ?? searchParams.get('q') ?? '').trim();
  if (!ticker) {
    return NextResponse.json({ ok: false, error: 'ticker required' }, { status: 400 });
  }

  const result = await loadPeEvaluation(ticker, session.tenantId);
  if (!result) {
    return NextResponse.json({ ok: false, error: 'Stock not found in StockBook' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, evaluation: result });
}

/** Stock Valuation Scorecard — purchase price + date + PARAMETERS. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const ticker = String(body.ticker ?? body.stockQuery ?? '').trim();
  const purchasePrice = Number(body.purchasePrice);
  const purchaseDate = parsePurchaseDate(String(body.purchaseDate ?? ''));

  if (!ticker) {
    return NextResponse.json({ ok: false, error: 'Stock ticker required' }, { status: 400 });
  }
  if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Purchase price must be a positive number' },
      { status: 400 }
    );
  }
  if (!purchaseDate) {
    return NextResponse.json(
      { ok: false, error: 'Purchase date required (YYYY-MM-DD, not in future)' },
      { status: 400 }
    );
  }

  const scorecard = await runPeEvaluationScorecard({
    ticker,
    purchasePrice,
    purchaseDate,
    tenantId: session.tenantId,
  });

  if (!scorecard) {
    return NextResponse.json({ ok: false, error: 'Stock not found in StockBook' }, { status: 404 });
  }

  const record = await savePeEvaluationRecord({
    tenantId: session.tenantId,
    userId: session.userId,
    authMode: session.authMode,
    scorecard,
  });

  return NextResponse.json({
    ok: true,
    scorecard,
    record: {
      id: record.id,
      createdAt: record.createdAt,
      ticker: record.ticker,
      stockName: record.stockName,
    },
    detailPath: `/stock-calculator/pe/${record.id}`,
  });
}
