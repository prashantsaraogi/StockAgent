import { ResourcesHubBar } from '@/components/ResourcesSubNav';

export default function PromptGuidelinesSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ResourcesHubBar />
      {children}
    </>
  );
}
