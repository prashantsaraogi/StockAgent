import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veersa Stock Agent',
  description: 'Veersa Stock Agent — portfolio, stock analysis, and Ask Agent',
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
