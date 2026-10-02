/** Hosted serverless (Vercel/Lambda): deployment dir is read-only — no tenant mkdir/write. */
export function isServerlessReadOnlyFs(): boolean {
  return (
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true' ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.env.NEXT_PUBLIC_READONLY_TENANT_FS === 'true'
  );
}

/** Create directory only when local/writable host; never throw on serverless. */
export async function safeMkdir(dir: string): Promise<boolean> {
  if (isServerlessReadOnlyFs()) return false;
  try {
    const fs = await import('fs/promises');
    await fs.mkdir(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

/** Write a file (mkdir parent) on local disk only; no-op on serverless — never throws. */
export async function safeWriteFile(filePath: string, content: string): Promise<boolean> {
  if (isServerlessReadOnlyFs()) return false;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const ok = await safeMkdir(path.dirname(filePath));
    if (!ok) return false;
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch {
    return false;
  }
}
