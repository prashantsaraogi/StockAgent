import { ResourcesHubBar } from '@/components/ResourcesSubNav';

export default function JournalSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ResourcesHubBar />
      {children}
    </>
  );
}
