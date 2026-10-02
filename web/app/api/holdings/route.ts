import { NextResponse } from 'next/server';
import { getSession, portfolioLotContext } from '@/lib/auth';
import { addHoldingLot, listLotsWithMetrics } from '@/lib/holding-lots';
import { parseHoldingsTable } from '@/lib/holdings';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const lotCtx = portfolioLotContext(session);
  const [lots, rows] = await Promise.all([
    listLotsWithMetrics(session.tenantId, lotCtx),
    parseHoldingsTable(session.tenantId),
  ]);

  return NextResponse.json({ ok: true, lots, summary: rows });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await addHoldingLot(
      session.tenantId,
      {
        stockName: String(body.stockName ?? ''),
        qty: Number(body.qty),
        price: Number(body.price),
        purchaseDate: String(body.purchaseDate ?? ''),
      },
      portfolioLotContext(session)
    );

    return NextResponse.json({
      ok: true,
      lot: result.lot,
      summary: result.rows,
      lots: result.lots,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add holding';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
