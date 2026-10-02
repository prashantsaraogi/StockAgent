import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserPaths } from '@/lib/tenant';
import { getSharedFrameworkPaths } from '@/lib/framework-paths';
import { readRepoFile, writeDevStockbookFile } from '@/lib/stockbook';

/**
 * MVP stub — proves safe write path to user tenant only.
 * Body: { ticker, sector, stockName, question? }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const ticker = String(body.ticker ?? 'MARUTI').toUpperCase();
    const sector = String(body.sector ?? 'Auto');
    const stockName = String(body.stockName ?? 'Maruti Suzuki');
    const question = String(body.question ?? 'Framework smoke test');

    const shared = getSharedFrameworkPaths();
    const userPaths = getUserPaths(session.tenantId);

    const agentRules = await readRepoFile('StockBook/AGENT-RULES.md');
    const holdings = await readRepoFile(
      `data/users/${session.tenantId}/portfolio/holdings.md`
    );

    const faqContent = `# ${stockName} — FAQ

**Ticker:** ${ticker} · **Updated:** ${new Date().toISOString().slice(0, 10)}  
**Source:** Web MVP stub · tenant \`${session.tenantId}\`

## Q1. Smoke test

**Question:** ${question}

**Answer:** Web agent read \`StockBook/AGENT-RULES.md\` (${agentRules.length} chars) and user holdings (${holdings.split('\n').length} lines). Write-back succeeded to \`${userPaths.stockbookDir}\`.

---

*Replace this stub with full framework agent.*
`;

    const writtenPath = await writeDevStockbookFile(
      `${sector}/${stockName}/faq.md`,
      faqContent,
      session.tenantId
    );

    return NextResponse.json({
      ok: true,
      message: 'Stub analyze complete — user StockBook write-back only',
      ticker,
      sector,
      stockName,
      tenantId: session.tenantId,
      writtenPath,
      framework: {
        repoRoot: shared.repoRoot,
        agentRulesPreview: agentRules.slice(0, 120) + '...',
      },
      protectedNote: 'Root StockBook/ was NOT modified',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
