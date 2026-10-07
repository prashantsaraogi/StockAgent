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
import { resolveStock, type StockSearchResult } from '@/lib/stock-search';

export const maxDuration = 120;

type QueryMode = 'stock' | 'general';

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

    const queryMode: QueryMode | undefined =
      rawMode === 'stock' || rawMode === 'general' ? rawMode : undefined;

    const lotCtx = portfolioLotContext(session);
    let analysisType: 'stock-full' | 'news' | 'general' = 'general';
    let result: NewsQueryResult | Awaited<ReturnType<typeof runFrameworkQuery>>;
    let route: Awaited<ReturnType<typeof routeAskAgentQuery>> | null = null;
    let fuzzyBanner = '';
    let resolvedTicker: string | undefined = ticker;
    let resolvedStockName: string | undefined = stockName;
    let resolvedSector: string | undefined = sector;

    if (queryMode === 'stock') {
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

      analysisType = 'stock-full';
      result = await runAskAgentStockAnalysis(session.tenantId, stock, lotCtx);

      resolvedTicker = stock.ticker;
      resolvedStockName = stock.company;
      resolvedSector = stock.sector;
    } else if (queryMode === 'general') {
      if (shouldRunNewsAgent(query)) {
        analysisType = 'news';
        result = await runNewsFrameworkQuery(query, {
          tenantId: session.tenantId,
          email: session.email,
          ticker,
          sector,
          stockName,
          portfolioLotContext: lotCtx,
        });
      } else {
        analysisType = 'general';
        route = await routeAskAgentQuery(query, { ticker, sector, stockName });
        result = await runFrameworkQuery(query, {
          tenantId: session.tenantId,
          email: session.email,
          ticker: route.stock?.ticker ?? ticker,
          sector: route.stock?.sector ?? sector,
          stockName: route.stock?.company ?? stockName,
          portfolioLotContext: lotCtx,
          generalQuery: true,
        });
        if (route.fuzzyStockMatch && route.stock) {
          fuzzyBanner = `> **Note:** Mentioned **${route.stock.company} (${route.stock.ticker})** for context.\n\n`;
        }
        resolvedTicker = route.stock?.ticker ?? ticker;
        resolvedStockName = route.stock?.company ?? stockName;
        resolvedSector = route.stock?.sector ?? sector;
      }
    } else {
      route = await routeAskAgentQuery(query, { ticker, sector, stockName });

      resolvedTicker = route.stock?.ticker ?? ticker;
      resolvedStockName = route.stock?.company ?? stockName;
      resolvedSector = route.stock?.sector ?? sector;

      const agentContext = {
        tenantId: session.tenantId,
        email: session.email,
        ticker: resolvedTicker,
        sector: resolvedSector,
        stockName: resolvedStockName,
        portfolioLotContext: lotCtx,
      };

      if (route.kind === 'news' || shouldRunNewsAgent(query)) {
        analysisType = 'news';
        result = await runNewsFrameworkQuery(query, agentContext);
      } else if (route.kind === 'stock-analysis' && route.stock) {
        analysisType = 'stock-full';
        result = await runAskAgentStockAnalysis(session.tenantId, route.stock, lotCtx);
      } else {
        result = await runFrameworkQuery(query, agentContext);
      }
    }

    const { mode, model } = result;
    let answer = sanitizeUserFacingAnswer(result.answer);
    if (fuzzyBanner) {
      answer = fuzzyBanner + answer;
    } else if (route?.fuzzyStockMatch && route.stock && queryMode !== 'stock') {
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
        queryMode: queryMode ?? 'auto',
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
