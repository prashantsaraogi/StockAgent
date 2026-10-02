'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STOCK_CALCULATOR_NAV } from '@/lib/navigation';

export function StockCalculatorSubNav() {
  const pathname = usePathname();

  return (
    <nav className="sub-nav calc-sub-nav" aria-label="Stock Calculator sections">
      {STOCK_CALCULATOR_NAV.map((item) => {
        const active =
          item.href === '/stock-calculator'
            ? pathname === '/stock-calculator' || pathname.startsWith('/stock-calculator/full/')
            : pathname.startsWith(item.href);
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
