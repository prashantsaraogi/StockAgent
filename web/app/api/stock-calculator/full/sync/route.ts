import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  cachedPayloadToFullRecord,
  upsertFullAnalysisRecordRemote,
} from '@/lib/upsert-full-analysis-remote';
import type { CachedFullAnalysis } from '@/lib/stock-full-analysis-session-cache';

/** Backfill Supabase when the browser still has sessionStorage but GET returned 404. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (session.authMode !== 'supabase') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: { entry?: CachedFullAnalysis };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const entry = body.entry;
  if (!entry?.id || !entry.analysis?.ticker) {
    return NextResponse.json({ ok: false, error: 'entry required' }, { status: 400 });
  }
  const record = cachedPayloadToFullRecord(entry);
  const result = await upsertFullAnalysisRecordRemote(session.userId, record);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error ?? 'Sync failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
