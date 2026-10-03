import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { readRepoMarkdown } from './content';
import { getDocBySlug } from './documentation-index';

const bundledDocsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'bundled',
  'docs'
);

export async function loadDocMarkdown(slug: string): Promise<string | null> {
  const doc = getDocBySlug(slug);
  if (!doc) return null;

  const fromRepo = await readRepoMarkdown(doc.path);
  if (fromRepo) return fromRepo;

  try {
    return await fs.readFile(path.join(bundledDocsDir, `${slug}.md`), 'utf8');
  } catch {
    return null;
  }
}
