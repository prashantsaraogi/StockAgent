import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { readRepoMarkdown } from './content';
import { GLOSSARY_PATH } from './documentation-index';

const bundledGlossary = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'bundled',
  'GLOSSARY.md'
);

export async function loadGlossaryMarkdown(): Promise<string | null> {
  const fromRepo = await readRepoMarkdown(GLOSSARY_PATH);
  if (fromRepo) return fromRepo;
  try {
    return await fs.readFile(bundledGlossary, 'utf8');
  } catch {
    return null;
  }
}
