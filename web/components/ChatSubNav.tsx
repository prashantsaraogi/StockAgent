'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CHAT_NAV = [
  { href: '/chat', label: 'Ask Agent' },
  { href: '/chat/prompts', label: 'Prompt Guidelines' },
] as const;

export function ChatSubNav() {
  const pathname = usePathname();

  return (
    <nav className="sub-nav chat-sub-nav" aria-label="Ask Agent sections">
      {CHAT_NAV.map((item) => {
        const active =
          item.href === '/chat'
            ? pathname === '/chat'
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
