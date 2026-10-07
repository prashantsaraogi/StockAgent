import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSession, portfolioLotContext } from '@/lib/auth';
import { createAnalysisJob, saveChatExchange } from '@/lib/db/records';
import { saveAnalysisRecord } from '@/lib/analysis-history';
import { routeAskAgentQuery } from '@/lib/ask-agent-query-router';
import { runAskAgentStockAnalysis } from '@/lib/ask-agent-stock-analysis';
import { sanitizeUserFacingAnswer } from '@/lib/investor-report-format';
import { resolveStock, type StockSearchResult } from '@/lib/stock-search';

export const maxDuration = 120;

function pickStockFromBody(body: Record<string, unknown>): StockSearchResult | null {
  const raw = body.selectedStock as
    | { ticker?: string; company?: string; sector?: string }
    | undefined;
  if (!raw?.ticker) return null;
  return {
    ticker: String(raw.ticker).toUpperCase(),
    company: String(raw.company ?? raw.ticker),
    sector: String(raw.sector ?? 'Other'),
    source: 'nse' as const,
    inStockBook: false,
    resolvedFrom: String(raw.ticker),
  };
}

/** Ask Agent — framework-backed Q&A; answer saved to Analysis Log. */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, ticker, sector, stockName, sessionId, queryMode: rawMode } = body;
    const query = String(message ?? '').trim();
    if (!query) {
      return NextResponse.json({ ok: false, error: 'Message required' }, { status: 400 });
    }

    if (rawMode === 'general') {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Ask Agent is stock search only. Pick a ticker, or use Prompt library / Cursor for portfolio-wide questions.',
        },
        { status: 400 }
      );
    }

    const lotCtx = portfolioLotContext(session);
    const analysisType = 'stock-full' as const;
    let route: Awaited<ReturnType<typeof routeAskAgentQuery>> | null = null;
    let fuzzyBanner = '';
    let resolvedTicker: string | undefined = ticker;
    let resolvedStockName: string | undefined = stockName;
    let resolvedSector: string | undefined = sector;

    let stock: StockSearchResult | null = pickStockFromBody(body);
    if (!stock && ticker) {
      stock = (await resolveStock(String(ticker))) ?? null;
    }
    if (!stock) {
      route = await routeAskAgentQuery(query, { ticker, sector, stockName });
      stock = route.stock;
      if (route.fuzzyStockMatch && stock) {
        fuzzyBanner = `> **Matched:** **${stock.company} (${stock.ticker})** — closest match for “${route.stockPhrase ?? query}”.\n\n`;
      }
    } else if (body.selectedStock == null && ticker) {
      stock = {
        ticker: String(ticker).toUpperCase(),
        company: String(stockName ?? ticker),
        sector: String(sector ?? 'Other'),
        source: 'nse',
        inStockBook: false,
        resolvedFrom: String(ticker),
      };
    }

    if (!stock) {
      return NextResponse.json({
        ok: false,
        error: 'Pick a stock from search (or open Ask from StockBook on a ticker).',
      });
    }

    const result = await runAskAgentStockAnalysis(session.tenantId, stock, lotCtx);

    resolvedTicker = stock.ticker;
    resolvedStockName = stock.company;
    resolvedSector = stock.sector;

    const { mode, model } = result;
    let answer = sanitizeUserFacingAnswer(result.answer);
    if (fuzzyBanner) {
      answer = fuzzyBanner + answer;
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
        queryMode: 'stock',
        resolvedTicker: analysisRecord.ticker ?? resolvedTicker ?? null,
        fuzzyStockMatch: route?.fuzzyStockMatch ?? false,
        resolvedStockName: resolvedStockName ?? null,
        tenantId: session.tenantId,
        analysisId: analysisRecord.id,
        analysisPath: analysisPersisted
          ? `/journal/analysis/${analysisRecord.id}`
          : undefined,
        analysisPersisted,
        inboxPath: `data/users/${session.tenantId}/agent-inbox/last-query.md`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
