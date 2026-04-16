import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'skillme — Claude Code plugin manager',
  description:
    'Detect your project stack and install the right Claude Code plugins in one command. 167+ plugins across 4 marketplaces.',
  openGraph: {
    title: 'skillme — Claude Code plugin manager',
    description: 'Install the right Claude Code plugins for your stack in one command.',
    url: 'https://abid101e.github.io/Skill-me',
    siteName: 'skillme',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
