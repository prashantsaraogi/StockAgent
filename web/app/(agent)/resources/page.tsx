import Link from 'next/link';
import { ResourcesSubNav } from '@/components/ResourcesSubNav';
import { RESOURCES_HUB_INTRO, RESOURCES_HUB_TITLE } from '@/lib/navigation';

const SECTIONS = [
  {
    href: '/journal/news',
    title: 'Journal',
    description: 'Daily news archive and Ask Agent analysis log — browse by date.',
  },
  {
    href: '/services',
    title: 'Services',
    description: 'Run refresh jobs (CMP, results, news packs) or launch copy-paste workflows.',
  },
  {
    href: '/wisdom',
    title: 'Wisdom',
    description: 'Quotes on patience, valuation, quality, and when to wait vs act.',
  },
  {
    href: '/readme',
    title: 'ReadMe',
    description: 'Glossary, documentation, and setup guides for the web app.',
  },
  {
    href: '/chat/prompts',
    title: 'Prompt Guidelines',
    description: 'Copy-paste prompts for buy/add, PCCL, news, portfolio, and morning runs.',
  },
] as const;

export default function ResourcesHubPage() {
  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>{RESOURCES_HUB_TITLE}</h1>
        <p className="muted">{RESOURCES_HUB_INTRO}</p>
        <ResourcesSubNav />
      </header>

      <div className="card-grid readme-overview-grid">
        {SECTIONS.map((section) => (
          <section key={section.href} className="card">
            <h3>{section.title}</h3>
            <p className="muted small">{section.description}</p>
            <Link href={section.href} className="btn-primary card-btn">
              Open {section.title} →
            </Link>
          </section>
        ))}
      </div>
    </div>
  );
}
