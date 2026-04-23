import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SiteTrafficTracker from '@/components/SiteTrafficTracker';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sherwood Technology Consulting | Salesforce & Full Stack Development',
  description:
    'Salesforce development, full stack engineering, and technology consulting by Sherwood Technology Consulting LLC.',
  keywords: ['salesforce', 'full stack', 'software engineer', 'react', 'next.js', 'consulting'],
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <SiteTrafficTracker />
          {/* Global background — fixed so it doesn't scroll with content */}
          <div
            className="fixed inset-0 -z-10 bg-[#0F1923] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
          />
          {/* Persistent dark overlay to keep bg subtle on all pages */}
          <div className="fixed inset-0 -z-10 bg-[#0F1923]/82" />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
