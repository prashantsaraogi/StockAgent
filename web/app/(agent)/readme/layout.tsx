import { ResourcesHubBar } from '@/components/ResourcesSubNav';

export default function ReadMeSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ResourcesHubBar />
      {children}
    </>
  );
}
