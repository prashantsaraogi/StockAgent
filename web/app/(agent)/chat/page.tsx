import Link from 'next/link';
import { ChatPanel } from '@/components/ChatPanel';
import { ProsePanel } from '@/components/ProsePanel';

export default function ChatPage() {
  return (
    <div className="page page-prose chat-page">
      <header className="page-header">
        <h1>Ask Agent</h1>
        <p className="muted">
          <strong>Stock search</strong> — pick a name or ticker for an investment view (factor lens,
          scorecard, PCCL, what to do). Portfolio-wide workflows:{' '}
          <Link href="/chat/prompts">Prompt Guidelines</Link> ·{' '}
          <Link href="/journal/analysis">Analysis Log</Link> ·{' '}
          <Link href="/resources">Resources &amp; Playbook</Link>. Conversation on this page
          restores from your account (last 24 Q&amp;A pairs).
        </p>
      </header>
      <ProsePanel className="chat-panel-wrap">
        <ChatPanel />
      </ProsePanel>
    </div>
  );
}
