import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { runPegEvaluation } from '@/lib/peg-evaluation';
import { savePegRecord } from '@/lib/peg-history';

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

  const analysis = await runPegEvaluation({ ticker, tenantId: session.tenantId });
  if (!analysis) {
    return NextResponse.json({ ok: false, error: 'Stock not found in StockBook' }, { status: 404 });
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

  const ticker = String(body.ticker ?? body.stockQuery ?? '').trim();
  if (!ticker) {
    return NextResponse.json({ ok: false, error: 'Stock ticker required' }, { status: 400 });
  }

  const analysis = await runPegEvaluation({ ticker, tenantId: session.tenantId });
  if (!analysis) {
    return NextResponse.json({ ok: false, error: 'Stock not found in StockBook' }, { status: 404 });
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
