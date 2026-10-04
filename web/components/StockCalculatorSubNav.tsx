'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STOCK_CALCULATOR_HUB_NAV } from '@/lib/navigation';

export function StockCalculatorSubNav() {
  const pathname = usePathname();

  return (
    <nav className="sub-nav calc-sub-nav" aria-label="Stock Analysis sections">
      {STOCK_CALCULATOR_HUB_NAV.map((item) => {
        const active =
          item.href === '/stock-calculator'
            ? pathname === '/stock-calculator'
            : pathname === '/stock-calculator/history' ||
              pathname.startsWith('/stock-calculator/full/');
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
