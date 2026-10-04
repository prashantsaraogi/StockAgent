import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  extractDocHeadings,
  getDocBySlug,
  isDocPublishedOnWeb,
  listAllDocs,
  listDocCategories,
} from '@/lib/documentation-index';
import { loadDocMarkdown } from '@/lib/load-doc-markdown';
import { ReadMeSubNav } from '@/components/ReadMeSubNav';
import { DocIndexSidebar, DocTableOfContents } from '@/components/DocTableOfContents';
import { MarkdownView } from '@/components/MarkdownView';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listAllDocs().map((d) => ({ slug: d.slug }));
}

export default async function DocumentationDetailPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc || !isDocPublishedOnWeb(doc)) notFound();

  const content = await loadDocMarkdown(slug);
  if (!content) {
    return (
      <div className="page page-prose">
        <header className="page-header">
          <p className="muted small">
            <Link href="/readme">ReadMe</Link> ·{' '}
            <Link href="/readme/documentation">Documentation</Link>
          </p>
          <h1>{doc.title}</h1>
          <p className="muted">{doc.description}</p>
          <ReadMeSubNav />
        </header>
        <p className="muted">
          Could not load <code>{doc.path}</code> on this host. Redeploy after{' '}
          <code>npm run sync-bundled-docs</code> or enable Vercel &quot;Include files outside
          Root Directory&quot;.
        </p>
      </div>
    );
  }

  const headings = extractDocHeadings(content);
  const categories = listDocCategories();

  return (
    <div className="page page-prose">
      <header className="page-header">
        <p className="muted small">
          <Link href="/readme">ReadMe</Link> ·{' '}
          <Link href="/readme/documentation">Documentation</Link>
        </p>
        <h1>{doc.title}</h1>
        <p className="muted">{doc.description}</p>
        <ReadMeSubNav />
      </header>

      <div className="split-layout doc-detail-layout">
        <DocIndexSidebar
          categories={categories.map((c) => ({
            id: c.id,
            label: c.label,
            docs: c.docs.map((d) => ({ slug: d.slug, title: d.title })),
          }))}
          activeSlug={slug}
        />

        <div className="doc-detail-main">
          <aside className="doc-toc-sidebar">
            <DocTableOfContents headings={headings} />
          </aside>

          <section className="content-panel prose-panel doc-detail-content">
            <MarkdownView content={content} headingAnchors />
          </section>
        </div>
      </div>
    </div>
  );
}
