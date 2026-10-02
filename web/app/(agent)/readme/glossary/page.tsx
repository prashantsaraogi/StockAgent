import { readRepoMarkdown } from '@/lib/content';
import { GLOSSARY_PATH } from '@/lib/documentation-index';
import { ReadMeSubNav } from '@/components/ReadMeSubNav';
import { MarkdownView } from '@/components/MarkdownView';

export default async function ReadMeGlossaryPage() {
  const content = await readRepoMarkdown(GLOSSARY_PATH);

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Glossary</h1>
        <p className="muted">Framework terms — PCCL, MoS, YoC, catalyst bands, and more.</p>
        <ReadMeSubNav />
      </header>
      {content ? (
        <section className="content-panel prose-panel">
          <p className="file-badge">{GLOSSARY_PATH}</p>
          <MarkdownView content={content} headingAnchors />
        </section>
      ) : (
        <p className="muted">GLOSSARY.md not found at repo root.</p>
      )}
    </div>
  );
}
