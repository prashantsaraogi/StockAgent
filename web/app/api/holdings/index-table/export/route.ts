import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { buildHoldingsIndexTableForSession } from '@/lib/holdings-index-for-user';
import { renderHoldingsIndexBenchmarkCsv } from '@/lib/holdings-index-export';
import { renderHoldingsIndexBenchmarkHtml } from '@/lib/holdings-index-html';

function safeFilePart(email: string): string {
  return email.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 48) || 'user';
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const table = await buildHoldingsIndexTableForSession(session);
  if (!table) {
    return NextResponse.json(
      {
        ok: false,
        error: 'No holdings yet. Add lots on Portfolio, then download the report.',
      },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') ?? 'csv').toLowerCase();
  const date = table.asOf.slice(0, 10);
  const base = `portfolio-index-benchmark-${safeFilePart(session.email)}-${date}`;

  if (format === 'html') {
    const body = renderHoldingsIndexBenchmarkHtml(table, {
      audience: 'web',
      userEmail: session.email,
    });
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${base}.html"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const body = renderHoldingsIndexBenchmarkCsv(table);
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${base}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
