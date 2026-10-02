import { NextResponse } from 'next/server';
import { getSession, portfolioLotContext } from '@/lib/auth';
import {
  updateHoldingLot,
  deleteHoldingLot,
  getHoldingLot,
} from '@/lib/holding-lots';

interface RouteParams {
  params: Promise<{ lotId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { lotId } = await params;
  const lotCtx = portfolioLotContext(session);
  const lot = await getHoldingLot(session.tenantId, lotId, lotCtx);
  if (!lot) {
    return NextResponse.json({ ok: false, error: 'Lot not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lot });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { lotId } = await params;
    const body = await request.json();
    const result = await updateHoldingLot(
      session.tenantId,
      lotId,
      {
        stockName: body.stockName ? String(body.stockName) : undefined,
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
    const message = err instanceof Error ? err.message : 'Failed to update lot';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { lotId } = await params;
    const result = await deleteHoldingLot(session.tenantId, lotId, portfolioLotContext(session));
    return NextResponse.json({
      ok: true,
      summary: result.rows,
      lots: result.lots,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete lot';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
