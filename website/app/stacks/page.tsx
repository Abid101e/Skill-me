import { getIndexData, getAllStacks, CATEGORY_STYLE, CATEGORY_ORDER } from '@/lib/data';
import type { StackInfo } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stacks — skillme',
  description: 'Browse Claude Code plugins by tech stack. Find the right plugins for React, Python, Go, Docker, and more.',
};

export default async function StacksPage() {
  const data = await getIndexData().catch(() => null);
  const stacks: StackInfo[] = data ? getAllStacks(data) : [];

  // Group by category, preserve CATEGORY_ORDER
  const grouped: Record<string, StackInfo[]> = {};
  for (const stack of stacks) {
    (grouped[stack.category] ??= []).push(stack);
  }

  const categories = CATEGORY_ORDER.filter(c => grouped[c]?.length);

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
          <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 md:px-12">
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

          {/* ── CATEGORY SECTIONS ── */}
          <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 md:px-12 space-y-16">
            {categories.map(category => {
              const style = CATEGORY_STYLE[category] ?? CATEGORY_STYLE['Meta'];
              const categoryStacks = grouped[category];
              return (
                <section key={category}>
                  {/* Section header */}
                  <div className="mb-6 flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                    <h2
                      className={`font-mono text-sm font-semibold uppercase tracking-widest ${style.sectionText}`}
                    >
                      {category}
                    </h2>
                    <span className="font-mono text-xs text-zinc-700">
                      {categoryStacks.length} stack{categoryStacks.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Stack cards grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryStacks.map(stack => (
                      <StackCard key={stack.id} stack={stack} style={style} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
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

function StackCard({ stack, style }: {
  stack: StackInfo;
  style: typeof CATEGORY_STYLE[string];
}) {
  return (
    <a
      href={`/stacks/${encodeURIComponent(stack.id)}`}
      className={`group relative flex flex-col rounded-xl border border-white/8 p-5 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]`}
      style={{
        backgroundImage: `
          radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(160deg, rgba(${stack.rgbaColor},0.10) 0%, transparent 65%)
        `,
        backgroundSize: '18px 18px, 100% 100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
      }}
    >
      {/* top row: category badge + arrow */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${style.badge}`}>
          <span className={`h-1 w-1 rounded-full ${style.dot}`} />
          {stack.category}
        </span>
        <span className="text-zinc-700 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 text-sm">
          →
        </span>
      </div>

      {/* stack name */}
      <h3 className={`mb-1 font-mono text-xl font-bold text-white transition-colors duration-200 ${style.hoverText}`}>
        {stack.displayName}
      </h3>

      {/* plugin count */}
      <p className="mb-4 font-mono text-xs text-zinc-600">
        {stack.plugins.length} plugin{stack.plugins.length !== 1 ? 's' : ''}
      </p>

      {/* plugin name pills */}
      <div className="flex flex-wrap gap-1.5">
        {stack.plugins.slice(0, 4).map(p => (
          <span
            key={p.name}
            className="max-w-32 truncate rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-500"
          >
            {p.name}
          </span>
        ))}
        {stack.plugins.length > 4 && (
          <span className="rounded-md bg-white/3 px-2 py-0.5 font-mono text-[10px] text-zinc-700">
            +{stack.plugins.length - 4} more
          </span>
        )}
      </div>
    </a>
  );
}
