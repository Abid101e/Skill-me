'use client';

import { useState } from 'react';
import type { Plugin } from '@/lib/types';

interface Props {
  plugin: Plugin;
}

export default function PluginCard({ plugin }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = () => {
    navigator.clipboard.writeText(`skillme install ${plugin.name}`).then(() => {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    }).catch(() => {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    });
  };

  // Clean description: strip markdown, cut at first sentence end, hard cap at 110 chars
  const shortDesc = (() => {
    const raw = plugin.description
      .split('\n')[0]
      .replace(/[#*`>_~]/g, '')
      .replace(/Examples?:.*/i, '')
      .replace(/Context:.*/i, '')
      .trim();
    const dot = raw.search(/[.!?](\s|$)/);
    return (dot > 20 ? raw.slice(0, dot + 1) : raw).slice(0, 110).trim();
  })();

  return (
    <div
      className="plugin-card group relative flex h-full flex-col rounded-xl border border-white/8 p-5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]"
      style={{
        backgroundImage: `
          radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
          linear-gradient(160deg, ${plugin.trusted ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.08)'} 0%, transparent 60%)
        `,
        backgroundSize: '18px 18px, 100% 100%',
        backgroundColor: 'rgba(255,255,255,0.04)',
      }}
    >

      {/* top row — name + badge */}
      <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
        <a
          href={`/plugins/${encodeURIComponent(plugin.name)}`}
          className="min-w-0 truncate font-mono text-sm font-semibold text-white transition-colors hover:text-emerald-400 sm:text-base"
        >
          {plugin.name}
        </a>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
            plugin.trusted
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-amber-500/15 text-amber-400'
          }`}
        >
          {plugin.trusted ? 'official' : 'community'}
        </span>
      </div>

      {/* description — always exactly 3 lines, no overflow ever */}
      <p className="mb-4 line-clamp-2 min-h-10 flex-1 text-sm leading-relaxed text-zinc-400">
        {shortDesc || 'No description available.'}
      </p>

      {/* tags — max 3, each tag truncated */}
      {plugin.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {plugin.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="max-w-25 truncate rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* binary warning — truncated */}
      {plugin.requiresBinary && (
        <p className="mb-3 truncate font-mono text-[11px] text-amber-500/70">
          requires: {plugin.requiresBinary}
        </p>
      )}

      {/* install button */}
      <button
        onClick={handleCopy}
        className="mt-auto flex w-full items-center justify-between rounded-lg border border-white/8 bg-white/4 px-3 py-2.5 font-mono text-xs text-zinc-400 transition-all duration-200 hover:border-emerald-500/50 hover:text-emerald-400 active:scale-95 sm:px-4"
      >
        <span className="min-w-0 truncate">skillme install {plugin.name}</span>
        <span className="ml-2 shrink-0 text-[10px] uppercase tracking-wider">
          {copyState === 'copied' ? '✓' : copyState === 'error' ? '✗' : 'copy'}
        </span>
      </button>
    </div>
  );
}
