// 루트 레이아웃 (메타데이터, 폰트, AppShell 적용)
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppShell } from '@/components/layout/AppShell';
import { ServiceWorkerRegistration } from '@/components/common/ServiceWorkerRegistration';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '10MB - 10 Minute Break',
  description: '쉬는 시간 10분 동안 낯선 사람과 음성으로 가볍게 소통하는 플랫폼',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '10MB',
  },
  icons: {
    apple: '/icons/icon-192.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f97316',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <ServiceWorkerRegistration />
        <main className="max-w-md mx-auto min-h-screen bg-white">
          <AppShell>{children}</AppShell>
        </main>
      </body>
    </html>
  );
}
