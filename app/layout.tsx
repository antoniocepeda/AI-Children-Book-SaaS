import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import './globals.css';

/**
 * Primary font - Inter for body text
 */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Display font - Outfit for headings
 */
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Storybook Magic - AI Children\'s Book Creator',
  description:
    'Create personalized, illustrated children\'s books in minutes with AI. Enter your child\'s name, pick a theme, and watch the magic happen.',
  keywords: ['children\'s books', 'AI', 'personalized', 'illustrated', 'stories', 'kids'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

