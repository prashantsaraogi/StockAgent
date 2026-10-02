import fs from 'fs/promises';
import { getSharedFrameworkPaths, getDevUserPaths } from './framework-paths';
import { fileExists } from './stockbook';

export interface PathCheck {
  label: string;
  path: string;
  exists: boolean;
  role: 'shared-read' | 'dev-read-write';
}

export async function verifyAllPaths(): Promise<{
  repoRoot: string;
  checks: PathCheck[];
  ok: boolean;
}> {
  const shared = getSharedFrameworkPaths();
  const dev = getDevUserPaths();

  const checks: PathCheck[] = [
    { label: 'Stock agent rules', path: shared.stockAgentRules, exists: false, role: 'shared-read' },
    { label: 'Skills directory', path: shared.skillsDir, exists: false, role: 'shared-read' },
    { label: 'Investor wisdom', path: shared.investorWisdomDir, exists: false, role: 'shared-read' },
    { label: 'AGENT-RULES', path: shared.agentRules, exists: false, role: 'shared-read' },
    { label: 'Buy decision workflow', path: shared.buyDecisionWorkflow, exists: false, role: 'shared-read' },
    { label: 'Dev holdings', path: dev.holdingsFile, exists: false, role: 'dev-read-write' },
    { label: 'Dev stockbook dir', path: dev.stockbookDir, exists: false, role: 'dev-read-write' },
  ];

  for (const check of checks) {
    check.exists = await fileExists(check.path);
  }

  return {
    repoRoot: shared.repoRoot,
    checks,
    ok: checks.every((c) => c.exists),
  };
}
