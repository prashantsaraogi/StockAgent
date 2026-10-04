import { loadGlossaryMarkdown } from '@/lib/load-glossary';
import { sanitizeUserFacingAnswer } from '@/lib/investor-report-format';
import { ReadMeSubNav } from '@/components/ReadMeSubNav';
import { MarkdownView } from '@/components/MarkdownView';

export default async function ReadMeGlossaryPage() {
  const content = await loadGlossaryMarkdown();

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Glossary</h1>
        <p className="muted">Investment terms — PCCL, MoS, YoC, catalyst bands, and more.</p>
        <ReadMeSubNav />
      </header>
      {content ? (
        <section className="content-panel prose-panel">
          <MarkdownView content={sanitizeUserFacingAnswer(content)} headingAnchors />
        </section>
      ) : (
        <p className="muted">GLOSSARY.md not found at repo root.</p>
      )}
    </div>
  );
}
