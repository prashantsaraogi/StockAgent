/** Hosted serverless (Vercel/Lambda): deployment dir is read-only — no tenant mkdir/write. */
export function isServerlessReadOnlyFs(): boolean {
  return (
    process.env.VERCEL === '1' ||
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
