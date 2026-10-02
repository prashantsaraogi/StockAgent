import fs from 'fs/promises';
import path from 'path';
import {
  BLOCKED_WRITE_PREFIXES,
  getDevUserPaths,
  getRepoRoot,
} from './framework-paths';
import { isServerlessReadOnlyFs, safeWriteFile } from './serverless-fs';

export class UnsafeWritePathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeWritePathError';
  }
}

/**
 * Ensures web MVP only writes under data/users/{tenant}/ — never root StockBook or .cursor/portfolio.
 */
export function assertSafeWritePath(filePath: string, tenantId = 'dev'): void {
  const root = getRepoRoot();
  const resolved = path.resolve(filePath);
  const { stockbookDir, portfolioDir, newsTickerIndex } = getDevUserPaths(tenantId);
  const allowedRoots = [
    path.resolve(stockbookDir),
    path.resolve(portfolioDir),
    path.resolve(path.dirname(newsTickerIndex)),
  ];

  const isUnderAllowed = allowedRoots.some(
    (allowed) => resolved === allowed || resolved.startsWith(allowed + path.sep)
  );

  if (!isUnderAllowed) {
    throw new UnsafeWritePathError(
      `Write blocked: ${resolved} is outside dev tenant. Allowed: data/users/${tenantId}/`
    );
  }

  const relative = path.relative(root, resolved).replace(/\\/g, '/');
  for (const blocked of BLOCKED_WRITE_PREFIXES) {
    if (relative === blocked || relative.startsWith(blocked + '/')) {
      throw new UnsafeWritePathError(
        `Write blocked: cannot modify shared/Cursor path ${blocked}`
      );
    }
  }
}

export async function writeDevStockbookFile(
  relativePath: string,
  content: string,
  tenantId = 'dev'
): Promise<string> {
  const { stockbookDir } = getDevUserPaths(tenantId);
  const fullPath = path.resolve(stockbookDir, relativePath);
  assertSafeWritePath(fullPath, tenantId);
  if (isServerlessReadOnlyFs()) {
    throw new UnsafeWritePathError('StockBook tenant writes are not supported on read-only hosting.');
  }
  const ok = await safeWriteFile(fullPath, content);
  if (!ok) {
    throw new UnsafeWritePathError('Could not write tenant file on this host.');
  }
  return fullPath;
}

export async function readRepoFile(relativeFromRoot: string): Promise<string> {
  const fullPath = path.join(getRepoRoot(), relativeFromRoot);
  try {
    return await fs.readFile(fullPath, 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new Error(`Framework file not found on server: ${relativeFromRoot}`);
    }
    throw err;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
