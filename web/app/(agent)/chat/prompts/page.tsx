import Link from 'next/link';
import { PromptGuidelinesPanel } from '@/components/PromptGuidelinesPanel';

export default function PromptGuidelinesPage() {
  return (
    <div className="page page-prose chat-page">
      <header className="page-header">
        <h1>Prompt Guidelines</h1>
        <p className="muted">
          Copy-paste prompts for buy/add, PCCL, news, risk, portfolio, and morning runs.{' '}
          <Link href="/chat">← Ask Agent</Link>
        </p>
      </header>
      <PromptGuidelinesPanel />
    </div>
  );
}
