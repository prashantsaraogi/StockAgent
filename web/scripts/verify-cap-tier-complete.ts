import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from '../lib/framework-paths';
import {
  EXPECTED_STOCKS_PER_LENS,
  parseCapTierUniverseFromMarkdown,
} from '../lib/sector-cap-universe-parser';
import { SECTOR_OUTLOOK_PATHS } from '../lib/sector-slugs';

async function main() {
  const root = getRepoRoot();
  let allComplete = true;

  console.log(`Cap tier verification — expected ${EXPECTED_STOCKS_PER_LENS} stocks per lens\n`);

  for (const [slug, relPath] of Object.entries(SECTOR_OUTLOOK_PATHS)) {
    const fullPath = path.join(root, relPath.replace(/\//g, path.sep));
    const md = await fs.readFile(fullPath, 'utf8');
    const parsed = parseCapTierUniverseFromMarkdown(md);

    const tierSummary = parsed.tiers.map((t) => {
      const g = t.lenses.find((l) => l.id === 'growth')!;
      const m = t.lenses.find((l) => l.id === 'market-cap')!;
      const total = g.stocks.length + m.stocks.length;
      const ok = g.stocks.length >= EXPECTED_STOCKS_PER_LENS && m.stocks.length >= EXPECTED_STOCKS_PER_LENS;
      return {
        tier: t.label,
        growth: g.stocks.length,
        mcap: m.stocks.length,
        total,
        ok,
      };
    });

    const sectorComplete = parsed.complete;
    if (!sectorComplete) allComplete = false;

    const status = sectorComplete ? '✓ 10/10 all tiers' : '✗ INCOMPLETE';
    console.log(`${slug.padEnd(18)} ${status}`);
    for (const ts of tierSummary) {
      const mark = ts.ok ? '✓' : '✗';
      console.log(`  ${mark} ${ts.tier.padEnd(12)} G:${ts.growth}/5 M:${ts.mcap}/5 (${ts.total}/10)`);
    }
    console.log('');
  }

  console.log(allComplete ? 'All sectors complete.' : 'Some sectors incomplete — see above.');
  process.exit(allComplete ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
