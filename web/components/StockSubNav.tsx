import Link from 'next/link';
import { STOCKBOOK_TABS } from '@/lib/navigation';

interface StockSubNavProps {
  sectorSlug: string;
  stockSlug: string;
  activeTab: string;
  stockName: string;
}

export function StockSubNav({ sectorSlug, stockSlug, activeTab, stockName }: StockSubNavProps) {
  return (
    <div className="sub-nav-wrap">
      <h2 className="page-title">{stockName}</h2>
      <nav className="sub-nav" aria-label="StockBook sections">
        {STOCKBOOK_TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/stockbook/${sectorSlug}/${stockSlug}/${tab.id}`}
            className={`sub-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
