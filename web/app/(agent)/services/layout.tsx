import { ResourcesHubBar } from '@/components/ResourcesSubNav';

export default function ServicesSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ResourcesHubBar />
      {children}
    </>
  );
}
