import { MarkdownView } from './MarkdownView';

interface ProsePanelProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
  title?: string;
}

/** Consistent readable container for markdown content (StockBook, News, Glossary, etc.) */
export function ProsePanel({ children, className = '', badge, title }: ProsePanelProps) {
  return (
    <section className={`content-panel prose-panel ${className}`.trim()}>
      {badge && <p className="file-badge">{badge}</p>}
      {title && <h2 className="panel-title">{title}</h2>}
      {children}
    </section>
  );
}

interface ProseContentProps {
  content: string;
  badge?: string;
  title?: string;
  className?: string;
}

export function ProseContent({ content, badge, title, className }: ProseContentProps) {
  return (
    <ProsePanel badge={badge} title={title} className={className}>
      <MarkdownView content={content} />
    </ProsePanel>
  );
}
