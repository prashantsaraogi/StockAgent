'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JOURNAL_NAV } from '@/lib/navigation';

export function JournalSubNav() {
  const pathname = usePathname();

  return (
    <nav className="sub-nav journal-sub-nav" aria-label="Journal sections">
      {JOURNAL_NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sub-tab ${active ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
