'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const README_NAV = [
  { href: '/readme', label: 'Overview', exact: true },
  { href: '/readme/glossary', label: 'Glossary' },
  { href: '/readme/documentation', label: 'Documentation', prefix: '/readme/documentation' },
] as const;

export function ReadMeSubNav() {
  const pathname = usePathname();

  return (
    <nav className="sub-nav readme-sub-nav" aria-label="ReadMe sections">
      {README_NAV.map((item) => {
        const active =
          'exact' in item && item.exact
            ? pathname === item.href
            : 'prefix' in item && item.prefix
              ? pathname.startsWith(item.prefix)
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
