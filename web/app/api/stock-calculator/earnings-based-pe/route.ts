import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  runEarningsBasedPeAnalysis,
  type EarningsBasedPeAnalysisResult,
} from '@/lib/earnings-based-pe-analysis';
import type { RunRateQuarterCount } from '@/lib/pe-quarterly-run-rate';

function parseQuarterCount(value: unknown): RunRateQuarterCount | null {
  const n = Number(value);
  if (n === 2 || n === 3 || n === 4 || n === 6) return n;
  return null;
}

/** Earnings-based P/E vs market TTM — Stock Analysis PE tab. */
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
  const quarterCount = parseQuarterCount(body.quarterCount ?? body.quarters ?? 4);

  if (!ticker) {
    return NextResponse.json({ ok: false, error: 'Stock ticker required' }, { status: 400 });
  }
  if (!quarterCount) {
    return NextResponse.json(
      { ok: false, error: 'quarterCount must be 2, 3, 4, or 6' },
      { status: 400 }
    );
  }

  const analysis = await runEarningsBasedPeAnalysis(ticker, quarterCount, session.tenantId);
  if (!analysis) {
    return NextResponse.json({ ok: false, error: 'Stock not found in StockBook' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, analysis } satisfies { ok: true; analysis: EarningsBasedPeAnalysisResult });
}
