import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Enshittification Clock',
  description:
    'Track the degradation of major tech platforms and services over time. See which services are getting worse and when it happened.',
  keywords: ['enshittification', 'tech platforms', 'service degradation', 'timeline'],
  openGraph: {
    title: 'Enshittification Clock',
    description:
      'Track the degradation of major tech platforms and services over time.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
