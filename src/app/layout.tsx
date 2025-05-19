import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import PWASetup from '@/components/PWASetup'; // Component to handle SW registration

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Good2Go Express',
  description: 'Quick and easy ordering for your essentials.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png', // Example, ensure you have these icons
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#76BA99" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <PWASetup />
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
