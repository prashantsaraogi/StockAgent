import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veersa Stock Agent',
  description: 'Veersa Stock Agent — India Stock Investment Framework web application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DisclaimerBanner />
        {children}
      </body>
    </html>
  );
}
