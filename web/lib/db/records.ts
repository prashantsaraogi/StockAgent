import type { SupabaseClient } from '@supabase/supabase-js';

export interface ChatMessageRow {
  id: string;
  user_id: string;
  session_id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  ticker: string | null;
  sector: string | null;
  stock_name: string | null;
  created_at: string;
}

export async function saveChatExchange(
  supabase: SupabaseClient,
  params: {
    userId: string;
    sessionId: string;
    userMessage: string;
    agentMessage: string;
    ticker?: string;
    sector?: string;
    stockName?: string;
  }
): Promise<void> {
  const { userId, sessionId, userMessage, agentMessage, ticker, sector, stockName } = params;

  const rows = [
    {
      user_id: userId,
      session_id: sessionId,
      role: 'user' as const,
      content: userMessage,
      ticker: ticker ?? null,
      sector: sector ?? null,
      stock_name: stockName ?? null,
    },
    {
      user_id: userId,
      session_id: sessionId,
      role: 'agent' as const,
      content: agentMessage,
      ticker: ticker ?? null,
      sector: sector ?? null,
      stock_name: stockName ?? null,
    },
  ];

  const { error } = await supabase.from('chat_messages').insert(rows);
  if (error) {
    console.error('chat_messages insert failed:', error.message);
  }
}

export async function createAnalysisJob(
  supabase: SupabaseClient,
  params: {
    userId: string;
    query: string;
    ticker?: string;
    sector?: string;
    stockName?: string;
  }
): Promise<string | null> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .insert({
      user_id: params.userId,
      query: params.query,
      ticker: params.ticker ?? null,
      sector: params.sector ?? null,
      stock_name: params.stockName ?? null,
      status: 'completed',
    })
    .select('id')
    .single();

  if (error) {
    console.error('analysis_jobs insert failed:', error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function getRecentChatMessages(
  supabase: SupabaseClient,
  userId: string,
  limit = 50
): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('chat_messages fetch failed:', error.message);
    return [];
  }
  return (data ?? []) as ChatMessageRow[];
}
