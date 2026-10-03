import { readRepoMarkdown } from './content';
import { getDocBySlug } from './documentation-index';
import { DOC_MARKDOWN_BY_SLUG } from './bundled/docs.generated';

export async function loadDocMarkdown(slug: string): Promise<string | null> {
  const doc = getDocBySlug(slug);
  if (!doc) return null;

  const fromRepo = await readRepoMarkdown(doc.path);
  if (fromRepo) return fromRepo;

  const bundled = DOC_MARKDOWN_BY_SLUG[slug as keyof typeof DOC_MARKDOWN_BY_SLUG];
  return bundled ?? null;
}
