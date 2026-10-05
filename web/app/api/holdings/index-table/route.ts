import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { buildHoldingsIndexTableForSession } from '@/lib/holdings-index-for-user';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const table = await buildHoldingsIndexTableForSession(session);
  if (!table) {
    return NextResponse.json({
      ok: true,
      empty: true,
      message:
        'Add purchase lots above to generate your private stock vs index report (vs cost, monthly/yearly vs sector index).',
      rows: [],
    });
  }

  return NextResponse.json({
    ok: true,
    email: session.email,
    ...table,
  });
}
