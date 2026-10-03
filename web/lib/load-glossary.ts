import { readRepoMarkdown } from './content';
import { GLOSSARY_PATH } from './documentation-index';
import { GLOSSARY_MARKDOWN } from './bundled/glossary.generated';

export async function loadGlossaryMarkdown(): Promise<string | null> {
  const fromRepo = await readRepoMarkdown(GLOSSARY_PATH);
  if (fromRepo) return fromRepo;
  if (GLOSSARY_MARKDOWN?.trim()) return GLOSSARY_MARKDOWN;
  return null;
}
