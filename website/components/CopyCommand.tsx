'use client';

import { useState } from 'react';

interface Props {
  command: string;
  noTruncate?: boolean;
}

export default function CopyCommand({ command, noTruncate }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = () => {
    navigator.clipboard.writeText(command).then(() => {
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    }).catch(() => {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy command: ${command}`}
      className={`group flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 sm:px-5 py-3.5 font-mono text-xs sm:text-sm text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/50 hover:bg-white/8 hover:text-white active:scale-95 ${noTruncate ? 'w-full' : 'w-full sm:w-auto'}`}
    >
      <span className="text-emerald-500 select-none shrink-0">$</span>
      <span className={`min-w-0 flex-1 ${noTruncate ? 'break-all' : 'truncate'}`}>{command}</span>
      <span className="ml-2 shrink-0 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-500 transition-colors group-hover:border-emerald-500/30 group-hover:text-emerald-400">
        {state === 'copied' ? '✓ copied' : state === 'error' ? '✗ failed' : 'copy'}
      </span>
    </button>
  );
}
