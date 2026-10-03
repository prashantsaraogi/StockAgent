import { readRepoMarkdown } from './content';
import { WISDOM_QUOTES_MARKDOWN } from './bundled/wisdom-quotes.generated';

/** Repo file when monorepo is on disk; generated string fallback on Vercel. */
export async function loadWisdomQuotes(): Promise<{
  content: string;
  badge: string;
} | null> {
  const fromRepo = await readRepoMarkdown('investor-wisdom/quotes.md');
  if (fromRepo) {
    return { content: fromRepo, badge: 'investor-wisdom/quotes.md' };
  }

  if (WISDOM_QUOTES_MARKDOWN?.trim()) {
    return { content: WISDOM_QUOTES_MARKDOWN, badge: 'investor-wisdom/quotes.md' };
  }

  return null;
}
