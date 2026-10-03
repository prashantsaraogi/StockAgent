import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugifyHeading } from '@/lib/documentation-index';
import { resolveMarkdownHref } from '@/lib/markdown-links';

interface MarkdownViewProps {
  content: string;
  className?: string;
  /** Add id anchors on h2/h3 for documentation TOC */
  headingAnchors?: boolean;
}

function headingText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(headingText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return headingText((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return String(children ?? '');
}

export function MarkdownView({
  content,
  className = '',
  headingAnchors = false,
}: MarkdownViewProps) {
  const usedIds = new Map<string, number>();

  function idFor(text: string): string {
    let id = slugifyHeading(text);
    const n = usedIds.get(id) ?? 0;
    if (n > 0) id = `${id}-${n}`;
    usedIds.set(slugifyHeading(text), n + 1);
    return id;
  }

  return (
    <article className={`markdown-prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
          h2: ({ children }) => {
            const text = headingText(children);
            const id = headingAnchors ? idFor(text) : undefined;
            return (
              <h2 className="md-h2" id={id}>
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = headingText(children);
            const id = headingAnchors ? idFor(text) : undefined;
            return (
              <h3 className="md-h3" id={id}>
                {children}
              </h3>
            );
          },
          h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
          table: ({ children }) => (
            <div className="md-table-wrap">
              <table className="md-table">{children}</table>
            </div>
          ),
          a: ({ href, children }) => {
            const resolved = resolveMarkdownHref(href);
            if (resolved?.kind === 'doc') {
              return (
                <Link href={`/readme/documentation/${resolved.slug}`}>{children}</Link>
              );
            }
            if (resolved?.kind === 'app') {
              return <Link href={resolved.href}>{children}</Link>;
            }
            if (resolved?.kind === 'same-page') {
              return <a href={resolved.href}>{children}</a>;
            }
            if (resolved?.kind === 'external') {
              return (
                <a href={resolved.href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          code: ({ className: cn, children }) => {
            const isBlock = cn?.includes('language-');
            if (isBlock) {
              return <code className={`md-code-block ${cn ?? ''}`}>{children}</code>;
            }
            return <code className="md-code-inline">{children}</code>;
          },
          pre: ({ children }) => <pre className="md-pre">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="md-blockquote">{children}</blockquote>
          ),
          hr: () => <hr className="md-hr" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

interface HtmlReportViewProps {
  html: string;
  title?: string;
}

export function HtmlReportView({ html, title }: HtmlReportViewProps) {
  return (
    <div className="report-frame-wrap">
      {title && <p className="file-badge">Report · {title}</p>}
      <iframe
        className="report-frame"
        title={title ?? 'Stock report'}
        sandbox="allow-same-origin"
        srcDoc={html}
      />
    </div>
  );
}
