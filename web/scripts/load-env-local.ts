import fs from 'fs';
import path from 'path';

/**
 * Load web/.env.local into process.env for CLI scripts (tsx does not auto-load it).
 */
export function loadEnvLocal(cwd = process.cwd()): boolean {
  const envPath = path.join(cwd, '.env.local');
  if (!fs.existsSync(envPath)) return false;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) process.env[key] = value;
  }
  return true;
}
