import { readRepoMarkdown } from './content';
import { getDocSlugForRepoPath } from './documentation-index';
import { loadDocMarkdown } from './load-doc-markdown';

/** StockBook framework files — repo disk or prebuild bundled docs. */
export async function loadFrameworkMarkdown(repoPath: string): Promise<string | null> {
  const fromRepo = await readRepoMarkdown(repoPath);
  if (fromRepo) return fromRepo;

  const slug = getDocSlugForRepoPath(repoPath);
  if (slug) return loadDocMarkdown(slug);

  return null;
}
