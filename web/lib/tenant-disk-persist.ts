import { isServerlessReadOnlyFs, safeWriteFile } from './serverless-fs';

/** Persist tenant JSON index (calculator / analysis history) — no-op on Vercel. */
export async function writeTenantIndexFile(
  filePath: string,
  data: object
): Promise<void> {
  if (isServerlessReadOnlyFs()) return;
  await safeWriteFile(filePath, JSON.stringify(data, null, 2));
}

/** Persist tenant markdown artifact — no-op on Vercel. */
export async function writeTenantMarkdownFile(
  filePath: string,
  content: string
): Promise<void> {
  if (isServerlessReadOnlyFs()) return;
  await safeWriteFile(filePath, content);
}
