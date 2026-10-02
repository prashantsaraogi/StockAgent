/** PostgREST / Postgres errors when a table or relation is not deployed yet. */
export function isMissingTableError(error: { message?: string; code?: string } | null): boolean {
  if (!error?.message) return false;
  const msg = error.message.toLowerCase();
  return (
    error.code === 'PGRST205' ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  );
}

const unavailableTables = new Set<string>();

export function markSupabaseTableUnavailable(table: string): void {
  unavailableTables.add(table);
}

export function isSupabaseTableUnavailable(table: string): boolean {
  return unavailableTables.has(table);
}

/** Dev-only hint — run once per table per process when migration is missing. */
export function warnMissingTableOnce(table: string, migrationFile: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  if (unavailableTables.has(`warn:${table}`)) return;
  unavailableTables.add(`warn:${table}`);
  console.warn(
    `[Supabase] Table public.${table} not found — using disk-only mode. ` +
      `Run supabase/migrations/${migrationFile} in the SQL editor.`
  );
}
