'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RESOURCES_NAV } from '@/lib/navigation';

export function ResourcesSubNav() {
  const pathname = usePathname();

  return (
    <nav className="sub-nav resources-sub-nav" aria-label="Resources and playbook sections">
      {RESOURCES_NAV.map((item) => {
        const active =
          'exact' in item && item.exact
            ? pathname === item.href
            : 'matchPrefix' in item && item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
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

/** Shared strip below main nav on all Resources hub sections */
export function ResourcesHubBar() {
  return (
    <div className="resources-hub-bar">
      <ResourcesSubNav />
    </div>
  );
}
