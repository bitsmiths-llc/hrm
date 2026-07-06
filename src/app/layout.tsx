import type { Metadata } from 'next';
import { Geist, Geist_Mono, Mulish } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';

import { ModeToggle } from '@/components/common/mode-toggle';
import PosthogAnalytics from '@/components/posthog/analytics';

import getMetadata from '@/config/app';

import AppProviders from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Bitsmiths brand body font (from company web).
const mulish = Mulish({
  variable: '--font-mulish',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = getMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} font-primary`}
      >
        <AppProviders>
          <PosthogAnalytics />
          <Toaster richColors />
          <div className='fixed right-4 top-4 z-50'>
            <ModeToggle />
          </div>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
