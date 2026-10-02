import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  analysisRecordsToChatMessages,
  listAnalysisRecordsForStock,
} from '@/lib/analysis-history';
import { createSessionId } from '@/lib/session-id';

/** Restore Ask Agent thread for a stock from Analysis Log (server). */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker') ?? undefined;
  const stockName = searchParams.get('stockName') ?? undefined;
  const limit = Math.min(Number(searchParams.get('limit') ?? 12) || 12, 30);

  if (!ticker && !stockName) {
    return NextResponse.json({ ok: false, error: 'ticker or stockName required' }, { status: 400 });
  }

  const records = await listAnalysisRecordsForStock(session.tenantId, {
    ticker,
    stockName,
    limit,
  });

  const messages = analysisRecordsToChatMessages(records);
  const sessionId =
    records.find((r) => r.sessionId)?.sessionId ?? createSessionId();

  return NextResponse.json({
    ok: true,
    messages,
    sessionId,
    count: records.length,
  });
}
