import { AppShell } from '@/components/AppShell';
import { requireSession } from '@/lib/auth';

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <AppShell
      email={session.email}
      tenantId={session.tenantId}
      authMode={session.authMode}
    >
      {children}
    </AppShell>
  );
}
