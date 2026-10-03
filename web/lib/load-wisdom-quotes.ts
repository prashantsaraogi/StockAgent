import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { readRepoMarkdown } from './content';

const bundledQuotesPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'bundled',
  'investor-wisdom-quotes.md'
);

/** Repo file when monorepo is on disk; bundled copy on Vercel without StockBook trace. */
export async function loadWisdomQuotes(): Promise<{
  content: string;
  badge: string;
} | null> {
  const fromRepo = await readRepoMarkdown('investor-wisdom/quotes.md');
  if (fromRepo) {
    return { content: fromRepo, badge: 'investor-wisdom/quotes.md' };
  }

  try {
    const content = await fs.readFile(bundledQuotesPath, 'utf8');
    return { content, badge: 'investor-wisdom/quotes.md' };
  } catch {
    return null;
  }
}
