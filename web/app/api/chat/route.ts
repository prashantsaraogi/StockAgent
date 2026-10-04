import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSession, portfolioLotContext } from '@/lib/auth';
import { createAnalysisJob, saveChatExchange } from '@/lib/db/records';
import { saveAnalysisRecord } from '@/lib/analysis-history';
import { runFrameworkQuery } from '@/lib/agent/framework-agent';
import { runNewsFrameworkQuery, shouldRunNewsAgent, type NewsQueryResult } from '@/lib/agent/news-agent';
import { routeAskAgentQuery } from '@/lib/ask-agent-query-router';
import { runAskAgentStockAnalysis } from '@/lib/ask-agent-stock-analysis';
import { sanitizeUserFacingAnswer } from '@/lib/investor-report-format';

export const maxDuration = 120;

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

    const route = await routeAskAgentQuery(query, { ticker, sector, stockName });

    const resolvedTicker = route.stock?.ticker ?? ticker;
    const resolvedStockName = route.stock?.company ?? stockName;
    const resolvedSector = route.stock?.sector ?? sector;

    const lotCtx = portfolioLotContext(session);
    const agentContext = {
      tenantId: session.tenantId,
      email: session.email,
      ticker: resolvedTicker,
      sector: resolvedSector,
      stockName: resolvedStockName,
      portfolioLotContext: lotCtx,
    };

    let analysisType: 'stock-full' | 'news' | 'general' = 'general';
    let result: NewsQueryResult | Awaited<ReturnType<typeof runFrameworkQuery>>;

    if (route.kind === 'news' || shouldRunNewsAgent(query)) {
      analysisType = 'news';
      result = await runNewsFrameworkQuery(query, agentContext);
    } else if (route.kind === 'stock-analysis' && route.stock) {
      analysisType = 'stock-full';
      const stockResult = await runAskAgentStockAnalysis(
        session.tenantId,
        route.stock,
        lotCtx
      );
      if (stockResult) {
        result = stockResult;
      } else {
        result = {
          answer: `Could not build a full report for **${route.stock.ticker}**. Try **Stock Analysis → Basic** or check server logs. General Q&A fallback is disabled for one-word stock queries.`,
          mode: 'framework-local' as const,
        };
      }
    } else {
      result = await runFrameworkQuery(query, agentContext);
    }

    const { mode, model } = result;
    let answer = sanitizeUserFacingAnswer(result.answer);
    if (route.fuzzyStockMatch && route.stock) {
      const from = route.stockPhrase ?? query;
      answer = `> **Matched:** **${route.stock.company} (${route.stock.ticker})** — closest match for “${from}”.\n\n${answer}`;
    }

    const chatSessionId =
      typeof sessionId === 'string' && sessionId.length > 0 ? sessionId : randomUUID();

    const { record: analysisRecord, persisted: analysisPersisted } = await saveAnalysisRecord({
      tenantId: session.tenantId,
      userId: session.userId,
      authMode: session.authMode,
      query,
      answer,
      agentMode: mode,
      sessionId: chatSessionId,
      ticker: resolvedTicker,
      sector: resolvedSector,
      stockName: resolvedStockName,
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
        ticker: analysisRecord.ticker ?? resolvedTicker,
        sector: analysisRecord.sector ?? resolvedSector,
        stockName: analysisRecord.stockName ?? resolvedStockName,
      });

      await createAnalysisJob(supabase, {
        userId: session.userId,
        query,
        ticker: analysisRecord.ticker ?? resolvedTicker,
        sector: analysisRecord.sector ?? resolvedSector,
        stockName: analysisRecord.stockName ?? resolvedStockName,
      });
    }

    return NextResponse.json({
      ok: true,
      answer,
      meta: {
        mode,
        model,
        analysisType,
        resolvedTicker: analysisRecord.ticker ?? resolvedTicker ?? null,
        fuzzyStockMatch: route.fuzzyStockMatch ?? false,
        resolvedStockName: resolvedStockName ?? null,
        tenantId: session.tenantId,
        analysisId: analysisRecord.id,
        analysisPath: analysisPersisted
          ? `/journal/analysis/${analysisRecord.id}`
          : undefined,
        analysisPersisted,
        inboxPath: `data/users/${session.tenantId}/agent-inbox/last-query.md`,
        ...(analysisType === 'news'
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
