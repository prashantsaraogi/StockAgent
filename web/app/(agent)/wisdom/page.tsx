import { ProseContent } from '@/components/ProsePanel';
import { loadWisdomQuotes } from '@/lib/load-wisdom-quotes';

export default async function WisdomPage() {
  const loaded = await loadWisdomQuotes();

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Wisdom</h1>
        <p className="muted">
          Personal quote lens — cited on PAUSE, WAIT, HOLD cash, and BUY decisions.
        </p>
      </header>

      {loaded ? (
        <ProseContent content={loaded.content} badge={loaded.badge} />
      ) : (
        <p className="muted">Load investor-wisdom/quotes.md to populate.</p>
      )}
    </div>
  );
}
