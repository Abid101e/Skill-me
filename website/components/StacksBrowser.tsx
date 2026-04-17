'use client';

import { useState, useMemo } from 'react';
import type { StackInfo } from '@/lib/data';
import { CATEGORY_STYLE, CATEGORY_ORDER } from '@/lib/data';

interface Props {
  stacks: StackInfo[];
}

export default function StacksBrowser({ stacks }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stacks;
    return stacks.filter(s =>
      s.displayName.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.plugins.some(p => p.name.toLowerCase().includes(q))
    );
  }, [stacks, query]);

  // Group filtered stacks by category
  const grouped: Record<string, StackInfo[]> = {};
  for (const stack of filtered) {
    (grouped[stack.category] ??= []).push(stack);
  }
  const categories = CATEGORY_ORDER.filter(c => grouped[c]?.length);

  return (
    <>
      {/* Search bar */}
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 md:px-12">
        <div className="relative max-w-sm">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-zinc-600">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stacks…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-4 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/7"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-600 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
        {query && (
          <p className="mt-2 font-mono text-xs text-zinc-600">
            {filtered.length} stack{filtered.length !== 1 ? 's' : ''} matching &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Category sections */}
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 md:px-12 space-y-16">
        {categories.length === 0 ? (
          <p className="py-16 text-center font-mono text-sm text-zinc-600">
            No stacks found for &ldquo;{query}&rdquo;
          </p>
        ) : (
          categories.map(category => {
            const style = CATEGORY_STYLE[category] ?? CATEGORY_STYLE['Meta'];
            const categoryStacks = grouped[category];
            return (
              <section key={category}>
                <div className="mb-6 flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <h2 className={`font-mono text-sm font-semibold uppercase tracking-widest ${style.sectionText}`}>
                    {category}
                  </h2>
                  <span className="font-mono text-xs text-zinc-700">
                    {categoryStacks.length} stack{categoryStacks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryStacks.map(stack => (
                    <StackCard key={stack.id} stack={stack} style={style} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </>
  );
}

function StackCard({ stack, style }: {
  stack: StackInfo;
  style: typeof CATEGORY_STYLE[string];
}) {
  return (
    <a
      href={`/stacks/${encodeURIComponent(stack.id)}`}
      className="group relative flex flex-col rounded-xl border border-white/8 p-5 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
      style={{
        backgroundImage: `
          radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(160deg, rgba(${stack.rgbaColor},0.10) 0%, transparent 65%)
        `,
        backgroundSize: '18px 18px, 100% 100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${style.badge}`}>
          <span className={`h-1 w-1 rounded-full ${style.dot}`} />
          {stack.category}
        </span>
        <span className="text-zinc-700 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 text-sm">
          →
        </span>
      </div>
      <h3 className={`mb-1 font-mono text-xl font-bold text-white transition-colors duration-200 ${style.hoverText}`}>
        {stack.displayName}
      </h3>
      <p className="mb-4 font-mono text-xs text-zinc-600">
        {stack.plugins.length} plugin{stack.plugins.length !== 1 ? 's' : ''}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {stack.plugins.slice(0, 4).map(p => (
          <span key={p.name} className="max-w-32 truncate rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
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
