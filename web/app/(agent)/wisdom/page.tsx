import { readRepoMarkdown } from '@/lib/content';
import { ProseContent } from '@/components/ProsePanel';

export default async function WisdomPage() {
  const content = await readRepoMarkdown('investor-wisdom/quotes.md');

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Wisdom</h1>
        <p className="muted">
          Personal quote lens — cited on PAUSE, WAIT, HOLD cash, and BUY decisions.
        </p>
      </header>

      {content ? (
        <ProseContent content={content} badge="investor-wisdom/quotes.md" />
      ) : (
        <p className="muted">Load investor-wisdom/quotes.md to populate.</p>
      )}
    </div>
  );
}
