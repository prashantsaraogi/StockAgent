import { ChatPanel } from '@/components/ChatPanel';
import { ChatSubNav } from '@/components/ChatSubNav';
import { ProsePanel } from '@/components/ProsePanel';

export default function ChatPage() {
  return (
    <div className="page page-prose chat-page">
      <header className="page-header">
        <h1>Ask Agent</h1>
        <p className="muted">
          Type a stock name or a question — you get a clear investment view; discipline and PCCL run
          behind the scenes.
        </p>
        <ChatSubNav />
      </header>
      <ProsePanel className="chat-panel-wrap">
        <ChatPanel />
      </ProsePanel>
    </div>
  );
}
