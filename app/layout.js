import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';
import AgeVerificationModal from '@/components/AgeVerificationModal';
import EmergingGenreModal from '@/components/EmergingGenreModal';
import AuthProvider from '@/components/AuthProvider';
import MobileBottomNav from '@/components/MobileBottomNav';
import PaymentModal from '@/components/PaymentModal';
import BankDetailsModal from '@/components/BankDetailsModal';
import Mascot3D from '@/components/Mascot3D';
import ParentalGateModal from '@/components/ParentalGateModal';

export const viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.avoralibrary.com'),
  title: 'Avora Library - Serialized Stories & Community Reading',
  description: 'Read and publish serialized fiction, interact with paragraph-level comments, and join passionate fandoms on mobile or desktop.',
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://www.avoralibrary.com',
  },
  openGraph: {
    title: 'Avora Library - Serialized Stories & Community Reading',
    description: 'Read and publish serialized fiction, interact with paragraph-level comments, and join passionate fandoms on mobile or desktop.',
    url: 'https://www.avoralibrary.com',
    siteName: 'Avora Library',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/tab-icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/tab-icon.png',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/tab-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/tab-icon.png" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="pb-16 md:pb-0 min-h-screen">
        <AuthProvider>
          <AppProvider>
            {children}
            <MobileBottomNav />
            <AuthModal />
            <OnboardingModal />
            <AgeVerificationModal />
            <EmergingGenreModal />
            <PaymentModal />
            <BankDetailsModal />
            <Mascot3D />
            <ParentalGateModal />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

