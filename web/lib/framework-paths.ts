import path from 'path';

/** Monorepo root (parent of web/) */
export function getRepoRoot(): string {
  return path.resolve(process.cwd(), '..');
}

/** Paths blocked for web write operations (protect Cursor live data) */
export const BLOCKED_WRITE_PREFIXES = [
  'StockBook',
  '.cursor/portfolio',
  '.cursor/rules',
  '.cursor/skills',
  'investor-wisdom',
  'News',
] as const;

export interface SharedFrameworkPaths {
  repoRoot: string;
  stockAgentRules: string;
  skillsDir: string;
  investorWisdomDir: string;
  agentRules: string;
  analysisLenses: string;
  sectorOutlookFramework: string;
  buyDecisionWorkflow: string;
  glossary: string;
  newsDir: string;
}

export interface DevUserPaths {
  tenantId: string;
  portfolioDir: string;
  holdingsFile: string;
  stockbookDir: string;
  newsTickerIndex: string;
}

export function getSharedFrameworkPaths(): SharedFrameworkPaths {
  const root = getRepoRoot();
  return {
    repoRoot: root,
    stockAgentRules: path.join(root, '.cursor/rules/stock-agent.mdc'),
    skillsDir: path.join(root, '.cursor/skills'),
    investorWisdomDir: path.join(root, 'investor-wisdom'),
    agentRules: path.join(root, 'StockBook/AGENT-RULES.md'),
    analysisLenses: path.join(root, 'StockBook/ANALYSIS-LENSES-FRAMEWORK.md'),
    sectorOutlookFramework: path.join(root, 'StockBook/SECTOR-OUTLOOK-FRAMEWORK.md'),
    buyDecisionWorkflow: path.join(root, 'investor-wisdom/buy-decision-workflow.md'),
    glossary: path.join(root, 'GLOSSARY.md'),
    newsDir: path.join(root, 'News'),
  };
}

export function getDevUserPaths(tenantId = 'dev'): DevUserPaths {
  const root = getRepoRoot();
  const userRoot = path.join(root, 'data/users', tenantId);
  return {
    tenantId,
    portfolioDir: path.join(userRoot, 'portfolio'),
    holdingsFile: path.join(userRoot, 'portfolio/holdings.md'),
    stockbookDir: path.join(userRoot, 'stockbook'),
    newsTickerIndex: path.join(userRoot, 'news/ticker-index.md'),
  };
}

/** Resolve stock folder under dev tenant stockbook */
export function getDevStockPath(sector: string, stockName: string, tenantId = 'dev'): string {
  const { stockbookDir } = getDevUserPaths(tenantId);
  return path.join(stockbookDir, sector, stockName);
}
