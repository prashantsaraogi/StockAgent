import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JournalSubNav } from '@/components/JournalSubNav';
import { readNewsSummary } from '@/lib/news-archive';
import { ProseContent } from '@/components/ProsePanel';

interface Props {
  params: Promise<{ year: string; month: string; day: string }>;
}

export default async function JournalNewsDayPage({ params }: Props) {
  const { year, month, day } = await params;
  const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const content = await readNewsSummary(date);
  if (!content) notFound();

  const label = new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="page page-prose">
      <Link href="/journal/news" className="back-link">
        ← Daily News
      </Link>

      <header className="page-header">
        <h1>{label}</h1>
        <p className="muted">
          <code>News/{date.slice(0, 7)}/{date}/summary.md</code>
        </p>
        <JournalSubNav />
      </header>

      <ProseContent content={content} title="Daily summary" badge={date} />
    </div>
  );
}
