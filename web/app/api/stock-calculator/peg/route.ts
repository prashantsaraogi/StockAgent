import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { runPegEvaluation } from '@/lib/peg-evaluation';
import { savePegRecord } from '@/lib/peg-history';
import { resolveStock } from '@/lib/stock-search';

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

  const resolved = await resolveStock(ticker);
  if (!resolved) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Stock not found — use NSE ticker (e.g. MARUTI) or pick a name from search suggestions.',
      },
      { status: 404 }
    );
  }

  const analysis = await runPegEvaluation({
    ticker: resolved.ticker,
    tenantId: session.tenantId,
  });
  if (!analysis) {
    return NextResponse.json({ ok: false, error: 'PEG analysis could not run for this ticker.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, analysis });
}

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

  const query = String(body.stockQuery ?? body.ticker ?? '').trim();
  if (!query) {
    return NextResponse.json({ ok: false, error: 'Stock ticker required' }, { status: 400 });
  }

  const resolved = await resolveStock(query);
  if (!resolved) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Stock not found — use NSE ticker (e.g. MARUTI) or pick a name from search suggestions.',
      },
      { status: 404 }
    );
  }

  const analysis = await runPegEvaluation({
    ticker: resolved.ticker,
    tenantId: session.tenantId,
  });
  if (!analysis) {
    return NextResponse.json({ ok: false, error: 'PEG analysis could not run for this ticker.' }, { status: 500 });
  }

  const record = await savePegRecord({
    tenantId: session.tenantId,
    userId: session.userId,
    authMode: session.authMode,
    analysis,
  });

  return NextResponse.json({
    ok: true,
    analysis,
    record: {
      id: record.id,
      createdAt: record.createdAt,
      ticker: record.ticker,
      stockName: record.stockName,
    },
    detailPath: `/stock-calculator/peg/${record.id}`,
  });
}
