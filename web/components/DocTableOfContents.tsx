import Link from 'next/link';
import type { DocHeading } from '@/lib/documentation-index';

interface DocTableOfContentsProps {
  headings: DocHeading[];
  title?: string;
}

export function DocTableOfContents({
  headings,
  title = 'On this page',
}: DocTableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav className="doc-toc" aria-label="Table of contents">
      <h3>{title}</h3>
      <ul className="doc-toc-list">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'doc-toc-h3' : undefined}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface DocIndexSidebarProps {
  categories: { id: string; label: string; docs: { slug: string; title: string }[] }[];
  activeSlug?: string;
}

export function DocIndexSidebar({ categories, activeSlug }: DocIndexSidebarProps) {
  return (
    <aside className="sidebar doc-index-sidebar">
      <h3>Documentation index</h3>
      {categories.map((cat) => (
        <div key={cat.id} className="doc-sidebar-category">
          <h4>{cat.label}</h4>
          <ul className="nav-list">
            {cat.docs.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={`/readme/documentation/${doc.slug}`}
                  className={activeSlug === doc.slug ? 'active' : undefined}
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
