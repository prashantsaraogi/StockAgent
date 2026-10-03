import { NextResponse } from 'next/server';
import { getSession, portfolioLotContext } from '@/lib/auth';
import { addHoldingLot, listLotsWithMetrics } from '@/lib/holding-lots';
import { parseHoldingsTable } from '@/lib/holdings';
import { isServerlessReadOnlyFs } from '@/lib/serverless-fs';

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

  const lotCtx = portfolioLotContext(session);
  if (isServerlessReadOnlyFs() && !lotCtx.userId) {
    return NextResponse.json(
      {
        ok: false,
        code: 'HOSTED_COOKIE_DEV',
        error:
          'On Vercel, sign in with Supabase (email + POC password), not dev cookie login. Remove FORCE_DEV_AUTH from Vercel env.',
      },
      { status: 403 }
    );
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
      lotCtx
    );

    return NextResponse.json({
      ok: true,
      lot: result.lot,
      summary: result.rows,
      lots: result.lots,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add holding';
    const status = message.includes('not found in StockBook') ? 404 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
