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
    const stockName = String(body.stockName ?? '').trim();
    const qty = Number(body.qty);
    const price = Number(body.price);
    const purchaseDate = String(body.purchaseDate ?? '').trim();

    if (!stockName) {
      return NextResponse.json(
        { ok: false, code: 'VALIDATION', error: 'Stock name or ticker is required.' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json(
        { ok: false, code: 'VALIDATION', error: 'Quantity must be a positive number.' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { ok: false, code: 'VALIDATION', error: 'Purchase price (₹) must be a positive number.' },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
      return NextResponse.json(
        { ok: false, code: 'VALIDATION', error: 'Purchase date must be YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const result = await addHoldingLot(
      session.tenantId,
      { stockName, qty, price, purchaseDate },
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
    let code = 'SAVE_FAILED';
    if (message.includes('not found in StockBook')) code = 'STOCK_NOT_FOUND';
    else if (message.includes('Portfolio table missing')) code = 'MISSING_MIGRATION_010';
    else if (message.includes('API key rejected')) code = 'SUPABASE_KEY_INVALID';
    else if (message.includes('upsert profile')) code = 'PROFILE_UPSERT_FAILED';
    else if (message.includes('Profile row missing')) code = 'PROFILE_MISSING';
    else if (message.includes('SUPABASE_SERVICE_ROLE_KEY missing')) code = 'MISSING_SERVICE_ROLE';
    else if (message.includes('Quantity must') || message.includes('Price must')) code = 'VALIDATION';

    const status = code === 'STOCK_NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ ok: false, code, error: message }, { status });
  }
}
