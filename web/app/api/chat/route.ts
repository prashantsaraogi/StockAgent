import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSession } from '@/lib/auth';
import { createAnalysisJob, saveChatExchange } from '@/lib/db/records';
import { saveAnalysisRecord } from '@/lib/analysis-history';
import { runFrameworkQuery } from '@/lib/agent/framework-agent';
import { runNewsFrameworkQuery, shouldRunNewsAgent, type NewsQueryResult } from '@/lib/agent/news-agent';

/** Ask Agent — framework-backed Q&A; answer saved to Analysis Log. */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { message, ticker, sector, stockName, sessionId } = await request.json();
    const query = String(message ?? '').trim();
    if (!query) {
      return NextResponse.json({ ok: false, error: 'Message required' }, { status: 400 });
    }

    const agentContext = {
      tenantId: session.tenantId,
      email: session.email,
      ticker,
      sector,
      stockName,
    };

    const isNews = shouldRunNewsAgent(query);
    const result: NewsQueryResult | Awaited<ReturnType<typeof runFrameworkQuery>> = isNews
      ? await runNewsFrameworkQuery(query, agentContext)
      : await runFrameworkQuery(query, agentContext);

    const { answer, mode, model } = result;

    const chatSessionId =
      typeof sessionId === 'string' && sessionId.length > 0 ? sessionId : randomUUID();

    const analysisRecord = await saveAnalysisRecord({
      tenantId: session.tenantId,
      userId: session.userId,
      authMode: session.authMode,
      query,
      answer,
      agentMode: mode,
      sessionId: chatSessionId,
      ticker,
      sector,
      stockName,
    });

    const supabase = await import('@/lib/supabase/server').then((m) =>
      m.createClientIfConfigured()
    );
    if (supabase && session.authMode === 'supabase') {
      await saveChatExchange(supabase, {
        userId: session.userId,
        sessionId: chatSessionId,
        userMessage: query,
        agentMessage: answer,
        ticker: analysisRecord.ticker ?? ticker,
        sector: analysisRecord.sector ?? sector,
        stockName: analysisRecord.stockName ?? stockName,
      });

      await createAnalysisJob(supabase, {
        userId: session.userId,
        query,
        ticker: analysisRecord.ticker ?? ticker,
        sector: analysisRecord.sector ?? sector,
        stockName: analysisRecord.stockName ?? stockName,
      });
    }

    return NextResponse.json({
      ok: true,
      answer,
      meta: {
        mode,
        model,
        tenantId: session.tenantId,
        analysisId: analysisRecord.id,
        analysisPath: `/journal/analysis/${analysisRecord.id}`,
        inboxPath: `data/users/${session.tenantId}/agent-inbox/last-query.md`,
        ...(isNews
          ? {
              newsWritten: true,
              newsDate: (result as NewsQueryResult).newsDate,
              newsWebPath: (result as NewsQueryResult).newsWebPath,
              newsFilePath: (result as NewsQueryResult).newsFilePath,
            }
          : {}),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
