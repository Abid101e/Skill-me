'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Plugin } from '@/lib/types';
import PluginCard from './PluginCard';

const PER_PAGE = 12;
const TOP_TAGS = 10;

type Filter = 'all' | 'official' | 'community';

interface Props {
  plugins: Plugin[];
  featuredNames?: string[];
}

export default function PluginBrowser({ plugins, featuredNames }: Props) {
  const featuredSet = useMemo(() => new Set(featuredNames ?? []), [featuredNames]);
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [query,     setQuery]     = useState(searchParams.get('q')      ?? '');
  const [filter,    setFilter]    = useState<Filter>(
    (searchParams.get('filter') as Filter) ?? 'all'
  );
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get('tag') ?? null);
  const [page,      setPage]      = useState(1);

  // Sync state → URL (debounced for query so typing doesn't thrash history)
  useEffect(() => {
    const params = new URLSearchParams();
    if (query)              params.set('q',      query);
    if (filter !== 'all')   params.set('filter', filter);
    if (activeTag)          params.set('tag',    activeTag);
    const qs  = params.toString();
    const url = `/plugins${qs ? `?${qs}` : ''}`;

    const id = setTimeout(() => router.replace(url, { scroll: false }), query ? 300 : 0);
    return () => clearTimeout(id);
  }, [query, filter, activeTag, router]);

  // Top tags by frequency
  const topTags = useMemo(() => {
    const counts: Record<string, number> = {};
    plugins.forEach(p => p.tags.forEach(t => {
      if (t) counts[t] = (counts[t] ?? 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_TAGS)
      .map(([tag]) => tag);
  }, [plugins]);

  // Filtered set
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plugins.filter(p => {
      if (filter === 'official'  && !p.trusted)  return false;
      if (filter === 'community' &&  p.trusted)  return false;
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [plugins, filter, activeTag, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function resetPage() { setPage(1); }

  function clearAll() {
    setQuery('');
    setFilter('all');
    setActiveTag(null);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 md:px-12">

      {/* ── Search + filters ── */}
      <div className="mb-8 flex flex-col gap-4">

        {/* Search */}
        <div className="relative">
          <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); resetPage(); }}
            placeholder="Search by name, tag, or description…"
            className="w-full rounded-xl border border-white/10 bg-white/4 py-3 pl-11 pr-4 font-mono text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-emerald-500/50 focus:bg-white/6"
          />
          {query && (
            <button onClick={() => { setQuery(''); resetPage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-lg leading-none"
            >×</button>
          )}
        </div>

        {/* Filter tabs + tag pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'official', 'community'] as Filter[]).map(f => (
            <button key={f}
              onClick={() => { setFilter(f); resetPage(); }}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'border border-white/8 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-white/10" />

          {topTags.filter(Boolean).map(tag => (
            <button key={tag}
              onClick={() => { setActiveTag(activeTag === tag ? null : tag); resetPage(); }}
              className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-all ${
                activeTag === tag
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'border border-white/8 text-zinc-600 hover:border-white/20 hover:text-zinc-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="mb-6 font-mono text-xs text-zinc-600">
        {filtered.length} plugin{filtered.length !== 1 ? 's' : ''} found
        {activeTag && <span> · tag: <span className="text-emerald-500">{activeTag}</span></span>}
        {(query || filter !== 'all' || activeTag) && (
          <button onClick={clearAll} className="ml-3 text-zinc-500 hover:text-emerald-400 transition-colors">
            clear ×
          </button>
        )}
      </p>

      {/* ── Grid ── */}
      {paginated.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map(plugin => (
            <div key={plugin.name} className="h-full">
              <PluginCard plugin={plugin} featured={featuredSet.has(plugin.name)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-zinc-500">No plugins match your search.</p>
          <button onClick={clearAll}
            className="mt-4 text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-white/8 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >←</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
            .reduce<(number | '…')[]>((acc, n, i, arr) => {
              if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('…');
              acc.push(n);
              return acc;
            }, [])
            .map((n, i) =>
              n === '…' ? (
                <span key={`e${i}`} className="px-1 text-zinc-600">…</span>
              ) : (
                <button key={n}
                  onClick={() => setPage(n as number)}
                  className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    page === n
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/8 text-zinc-500 hover:border-white/20 hover:text-white'
                  }`}
                >{n}</button>
              )
            )}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-white/8 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >→</button>
        </div>
      )}
    </div>
  );
}
