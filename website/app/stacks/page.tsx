import { getIndexData, getAllStacks } from '@/lib/data';
import StacksBrowser from '@/components/StacksBrowser';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stacks — skillme',
  description: 'Browse Claude Code plugins by tech stack. Find the right plugins for React, Python, Go, Docker, and more.',
};

export default async function StacksPage() {
  const data = await getIndexData().catch(() => null);
  const stacks = data ? getAllStacks(data) : [];

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* background orb */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-full rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)' }}
      />

      <div className="relative z-10">

        {/* ── NAV ── */}
        <nav className="flex items-center justify-between px-4 py-5 sm:px-6 md:px-12">
          <a href="/" className="font-mono text-lg font-semibold text-white">
            skill<span style={{ color: '#10b981' }}>me</span>
          </a>
          <div className="flex items-center gap-4 sm:gap-5">
            <a href="/plugins" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Plugins
            </a>
            <a href="/docs" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Docs
            </a>
            <a href="https://github.com/Abid101e/Skill-me" target="_blank" rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-white">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/skillme" target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-all hover:border-emerald-500/50 hover:text-white sm:px-4">
              npm
            </a>
          </div>
        </nav>

        <main>
          {/* ── PAGE HEADER ── */}
          <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 md:px-12">
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-violet-400">
              Stack Directory
            </div>
            <h1
              className="mb-3 text-4xl font-extrabold text-white sm:text-5xl"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Browse by Stack
            </h1>
            <p className="text-zinc-400">
              {stacks.length} stacks · find the right plugins for your exact tech setup.
            </p>
          </section>

          <StacksBrowser stacks={stacks} />
        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/6 px-4 py-8 sm:px-6 md:px-12">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <a href="/" className="font-mono text-sm text-zinc-600 transition-colors hover:text-white">
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
