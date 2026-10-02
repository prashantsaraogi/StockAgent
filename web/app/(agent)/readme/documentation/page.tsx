import Link from 'next/link';
import { listDocCategories } from '@/lib/documentation-index';
import { ReadMeSubNav } from '@/components/ReadMeSubNav';

export default function DocumentationIndexPage() {
  const categories = listDocCategories();
  const totalDocs = categories.reduce((n, c) => n + c.docs.length, 0);

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Documentation</h1>
        <p className="muted">
          Index of framework and web app docs — <strong>{totalDocs}</strong> articles with
          in-page table of contents on each detail page.
        </p>
        <ReadMeSubNav />
      </header>

      {categories.map((cat) => (
        <section key={cat.id} className="doc-category-block card wide">
          <header className="doc-category-head">
            <h2>{cat.label}</h2>
            <p className="muted small">{cat.description}</p>
          </header>
          <div className="doc-index-grid">
            {cat.docs.map((doc, idx) => (
              <Link
                key={doc.slug}
                href={`/readme/documentation/${doc.slug}`}
                className="doc-index-card"
              >
                <span className="doc-index-num">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{doc.title}</strong>
                  <p className="muted small">{doc.description}</p>
                  <span className="doc-index-path muted small">{doc.path}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
