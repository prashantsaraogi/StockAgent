import { ResourcesHubBar } from '@/components/ResourcesSubNav';

export default function WisdomSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ResourcesHubBar />
      {children}
    </>
  );
}
