import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  analysisRecordsToChatMessages,
  listAnalysisRecordsForStock,
  listRecentAnalysisRecords,
} from '@/lib/analysis-history';
import { createSessionId } from '@/lib/session-id';

/** Restore Ask Agent thread for a stock from Analysis Log (server). */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope');
  const ticker = searchParams.get('ticker') ?? undefined;
  const stockName = searchParams.get('stockName') ?? undefined;
  const defaultLimit = scope === 'user' ? 24 : 12;
  const limit = Math.min(Number(searchParams.get('limit') ?? defaultLimit) || defaultLimit, 60);

  const readCtx = { userId: session.userId, authMode: session.authMode };

  let records;
  if (scope === 'user') {
    records = await listRecentAnalysisRecords(session.tenantId, { limit }, readCtx);
  } else {
    if (!ticker && !stockName) {
      return NextResponse.json(
        { ok: false, error: 'ticker, stockName, or scope=user required' },
        { status: 400 }
      );
    }
    records = await listAnalysisRecordsForStock(
      session.tenantId,
      {
        ticker,
        stockName,
        limit,
      },
      readCtx
    );
  }

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
