'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { isResourcesSectionPath, MAIN_NAV } from '@/lib/navigation';

interface AppShellProps {
  email: string;
  tenantId: string;
  authMode: 'supabase' | 'cookie-dev';
  children: React.ReactNode;
}

export function AppShell({ email, tenantId, authMode, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <BrandLogo />
          <div>
            <strong>Veersa Stock Agent</strong>
            <span className="brand-sub">India equity · long-term investing</span>
          </div>
        </div>
        <div className="header-actions">
          <span className="user-email" title={`Tenant: ${tenantId}`}>
            {email}
            {authMode === 'cookie-dev' && <span className="tag warn">dev</span>}
          </span>
          <button type="button" className="btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <nav className="main-nav" aria-label="Main">
        {MAIN_NAV.map((item) => {
          let active = pathname === item.href;
          if (!active && item.href === '/resources') {
            active = isResourcesSectionPath(pathname);
          } else if (!active && item.href === '/stock-calculator') {
            active = pathname.startsWith('/stock-calculator');
          } else if (!active && item.href !== '/home') {
            active = pathname.startsWith(item.href);
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-tab ${active ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="app-main">{children}</main>
    </div>
  );
}
