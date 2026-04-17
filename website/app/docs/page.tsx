import DocsClient from '@/components/DocsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docs — skillme',
  description: 'Complete reference for skillme — the missing plugin manager for Claude Code. Commands, stack detection, AI mode, team sync, and scopes.',
};

export default function DocsPage() {
  return <DocsClient />;
}
