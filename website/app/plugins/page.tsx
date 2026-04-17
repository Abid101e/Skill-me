import { Suspense } from 'react';
import { getIndexData, getAllPlugins } from '@/lib/data';
import PluginBrowser from '@/components/PluginBrowser';
import type { Plugin } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Plugins — skillme',
  description: 'Search and browse all Claude Code plugins across official and community marketplaces.',
};

export default async function PluginsPage() {
  const data = await getIndexData().catch(() => null);
  const plugins: Plugin[] = data ? getAllPlugins(data) : [];
  const featuredNames: string[] = data?.featured ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* background orb */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-full rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 70%)' }}
      />

      <div className="relative z-10">

        {/* ── NAV ── */}
        <nav className="flex items-center justify-between px-4 py-5 sm:px-6 md:px-12">
          <a href="/" className="font-mono text-lg font-semibold text-white">
            skill<span style={{ color: '#10b981' }}>me</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/stacks" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Stacks
            </a>
            <a href="/docs" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Docs
            </a>
            <a
              href="https://github.com/Abid101e/Skill-me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/skillme"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-all hover:border-emerald-500/50 hover:text-white sm:px-4"
            >
              npm
            </a>
          </div>
        </nav>

        <main>
        {/* ── PAGE HEADER ── */}
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 md:px-12">
          <div className="mb-2 font-mono text-xs text-emerald-500 uppercase tracking-widest">
            Plugin Directory
          </div>
          <h1
            className="mb-3 text-4xl font-extrabold text-white sm:text-5xl"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Browse Plugins
          </h1>
          <p className="text-zinc-400">
            {plugins.length} plugins across official and community marketplaces.
          </p>
        </section>

        {/* ── BROWSER ── */}
        <Suspense fallback={
          <div className="py-24 text-center font-mono text-sm text-zinc-600">Loading plugins…</div>
        }>
          <PluginBrowser plugins={plugins} featuredNames={featuredNames} />
        </Suspense>

        </main>
        {/* ── FOOTER ── */}
        <footer className="border-t border-white/6 px-4 py-8 sm:px-6 md:px-12">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <a href="/" className="font-mono text-sm text-zinc-600 hover:text-white transition-colors">
              ← Back to home
            </a>
            <div className="flex gap-5 text-sm text-zinc-600">
              <a href="https://github.com/Abid101e/Skill-me" target="_blank" rel="noopener noreferrer"
                className="transition-colors hover:text-white">GitHub</a>
              <a href="https://www.npmjs.com/package/skillme" target="_blank" rel="noopener noreferrer"
                className="transition-colors hover:text-white">npm</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
