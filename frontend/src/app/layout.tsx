import type { Metadata } from 'next';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multi-Tenant CRM',
  description: 'BXTrack take-home CRM',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
