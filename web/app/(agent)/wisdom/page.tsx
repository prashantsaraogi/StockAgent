import { ProseContent } from '@/components/ProsePanel';
import { sanitizeWisdomMarkdownForWeb } from '@/lib/investor-report-format';
import { loadWisdomQuotes } from '@/lib/load-wisdom-quotes';

export default async function WisdomPage() {
  const loaded = await loadWisdomQuotes();

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Wisdom</h1>
        <p className="muted">
          Timeless quotes for patience, valuation, quality, and when to wait vs act.
        </p>
      </header>

      {loaded ? (
        <ProseContent content={sanitizeWisdomMarkdownForWeb(loaded.content)} />
      ) : (
        <p className="muted">Quote library is not available on this host yet.</p>
      )}
    </div>
  );
}
