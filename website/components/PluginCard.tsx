'use client';

import { useState } from 'react';
import type { Plugin } from '@/lib/types';

interface Props {
  plugin: Plugin;
}

export default function PluginCard({ plugin }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`skillme install ${plugin.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="plugin-card group relative flex flex-col rounded-xl border border-white/8 bg-white/3 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]">

      {/* top row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-mono text-base font-semibold text-white">
          {plugin.name}
        </h3>
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

      {/* description */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-400">
        {plugin.description}
      </p>

      {/* tags */}
      {plugin.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {plugin.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* binary warning */}
      {plugin.requiresBinary && (
        <p className="mb-3 font-mono text-[11px] text-amber-500/70">
          requires: {plugin.requiresBinary}
        </p>
      )}

      {/* install button */}
      <button
        onClick={handleCopy}
        className="mt-auto flex items-center justify-between rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 font-mono text-xs text-zinc-400 transition-all duration-200 hover:border-emerald-500/50 hover:text-emerald-400 active:scale-95"
      >
        <span className="truncate">skillme install {plugin.name}</span>
        <span className="ml-3 shrink-0 text-[10px] uppercase tracking-wider">
          {copied ? '✓ copied' : 'copy'}
        </span>
      </button>
    </div>
  );
}
