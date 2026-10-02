import { ServicesPanel } from '@/components/ServicesPanel';
import { loadServicesStatus } from '@/lib/services-status';
import { requireSession } from '@/lib/auth';

export default async function ServicesPage() {
  await requireSession();
  const status = await loadServicesStatus();

  return (
    <div className="page page-prose services-page">
      <header className="page-header">
        <h1>Services</h1>
        <p className="muted">
          Refresh CMP, quarterly results, broker calls, industry data, and news — run automated
          packs or copy agent prompts.
        </p>
      </header>
      <ServicesPanel initialStatus={status} />
    </div>
  );
}
