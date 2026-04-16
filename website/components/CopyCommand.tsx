'use client';

import { useState } from 'react';

interface Props {
  command: string;
}

export default function CopyCommand({ command }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 sm:px-5 py-3.5 font-mono text-xs sm:text-sm text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/50 hover:bg-white/8 hover:text-white active:scale-95 w-full sm:w-auto"
    >
      <span className="text-emerald-500 select-none shrink-0">$</span>
      <span className="min-w-0 flex-1 truncate">{command}</span>
      <span className="ml-2 shrink-0 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-500 transition-colors group-hover:border-emerald-500/30 group-hover:text-emerald-400">
        {copied ? '✓ copied' : 'copy'}
      </span>
    </button>
  );
}
