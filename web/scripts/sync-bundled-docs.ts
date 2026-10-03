/**
 * Copy documentation catalog files into web/lib/bundled/docs for Vercel/serverless.
 * Run: npm run sync-bundled-docs (also runs before build).
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GLOSSARY_PATH, listAllDocs } from '../lib/documentation-index';

const webDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.join(webDir, '..');
const bundledDocs = path.join(webDir, 'lib/bundled/docs');
const bundledGlossary = path.join(webDir, 'lib/bundled/GLOSSARY.md');

async function copyIfExists(from: string, to: string): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  let ok = 0;
  let miss = 0;

  for (const doc of listAllDocs()) {
    const src = path.join(repoRoot, doc.path.replace(/\//g, path.sep));
    const dest = path.join(bundledDocs, `${doc.slug}.md`);
    if (await copyIfExists(src, dest)) ok += 1;
    else {
      miss += 1;
      console.warn(`[sync-bundled-docs] missing: ${doc.path}`);
    }
  }

  const glossarySrc = path.join(repoRoot, GLOSSARY_PATH);
  if (await copyIfExists(glossarySrc, bundledGlossary)) ok += 1;
  else {
    miss += 1;
    console.warn(`[sync-bundled-docs] missing: ${GLOSSARY_PATH}`);
  }

  console.log(`[sync-bundled-docs] copied ${ok} file(s), ${miss} missing`);
  if (miss > 0) process.exitCode = 0;
}

main();
