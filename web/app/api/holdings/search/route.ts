import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { searchStocks } from '@/lib/stock-search';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const results = await searchStocks(q, 15);

  return NextResponse.json({ ok: true, results });
}
