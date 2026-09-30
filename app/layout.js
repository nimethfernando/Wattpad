import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';
import SocialOAuthModal from '@/components/SocialOAuthModal';

export const metadata = {
  title: 'Avora Library - Serialized Stories & Community Reading',
  description: 'Read and publish serialized fiction, interact with paragraph-level comments, and join passionate fandoms on mobile or desktop.',
  manifest: '/manifest.json',
  themeColor: '#ea580c',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <AppProvider>
          {children}
          <AuthModal />
          <OnboardingModal />
          <SocialOAuthModal />
        </AppProvider>
      </body>
    </html>
  );
}

