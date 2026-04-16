'use client';

import { useEffect, useRef, useState } from 'react';

const CMD = 'skillme init';
const TYPE_MS  = 65;
const LINE_MS  = 220;
const PAUSE_MS = 3200;
const RESET_MS = 600;

type LineKind = 'blank' | 'info' | 'success' | 'label' | 'plugin' | 'prompt';

interface OutputLine {
  kind: LineKind;
  text?: string;
  name?: string;
  badge?: string;
}

const OUTPUT: OutputLine[] = [
  { kind: 'info',    text: '◆  Scanning project...' },
  { kind: 'success', text: '✓  Next.js · TypeScript · Prisma' },
  { kind: 'blank' },
  { kind: 'label',   text: 'Recommended plugins:' },
  { kind: 'plugin',  name: 'typescript-lsp',    badge: 'official' },
  { kind: 'plugin',  name: 'commit-commands',   badge: 'official' },
  { kind: 'plugin',  name: 'pr-review-toolkit', badge: 'official' },
  { kind: 'blank' },
  { kind: 'prompt',  text: 'Install 3 plugins? ›  Yes' },
  { kind: 'blank' },
  { kind: 'success', text: '✓  3 plugins installed → project scope' },
];

export default function Terminal() {
  const [typed, setTyped]   = useState('');
  const [lines, setLines]   = useState<OutputLine[]>([]);
  const [cursor, setCursor] = useState(true);
  const cancel = useRef(false);

  // Blinking cursor — independent of sequence
  useEffect(() => {
    const id = setInterval(() => setCursor(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Main animation sequence
  useEffect(() => {
    cancel.current = false;

    const sleep = (ms: number) =>
      new Promise<void>(res => setTimeout(res, ms));

    async function run() {
      // 1 — type the command
      for (let i = 1; i <= CMD.length; i++) {
        if (cancel.current) return;
        setTyped(CMD.slice(0, i));
        await sleep(TYPE_MS);
      }

      await sleep(380);

      // 2 — reveal output lines one by one
      for (let i = 0; i < OUTPUT.length; i++) {
        if (cancel.current) return;
        setLines(prev => [...prev, OUTPUT[i]]);
        await sleep(OUTPUT[i].kind === 'blank' ? 80 : LINE_MS);
      }

      // 3 — pause so the user can read it
      await sleep(PAUSE_MS);
      if (cancel.current) return;

      // 4 — clear and restart
      setTyped('');
      setLines([]);
      await sleep(RESET_MS);
      if (cancel.current) return;
      run();
    }

    run();
    return () => { cancel.current = true; };
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
      style={{ background: '#0d1117' }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        <span className="ml-3 font-mono text-xs text-zinc-500">skillme — zsh</span>
      </div>

      {/* Content */}
      <div className="min-h-64 px-5 py-4 font-mono text-sm">

        {/* Prompt + typed command */}
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 select-none">$</span>
          <span className="text-white">{typed}</span>
          <span
            className="inline-block h-4 w-[2px] bg-emerald-400 align-middle"
            style={{ opacity: cursor ? 1 : 0, transition: 'opacity 0.1s' }}
          />
        </div>

        {/* Output lines */}
        <div className="mt-2 space-y-0.5">
          {lines.map((line, i) => {
            if (line.kind === 'blank') {
              return <div key={i} className="h-3" />;
            }
            if (line.kind === 'info') {
              return (
                <div key={i} className="text-zinc-500">{line.text}</div>
              );
            }
            if (line.kind === 'success') {
              return (
                <div key={i} className="text-emerald-400">{line.text}</div>
              );
            }
            if (line.kind === 'label') {
              return (
                <div key={i} className="mt-1 text-zinc-400">{line.text}</div>
              );
            }
            if (line.kind === 'plugin') {
              return (
                <div key={i} className="flex items-center gap-3 pl-4">
                  <span className="text-zinc-500 select-none">→</span>
                  <span className="w-44 text-white">{line.name}</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                    {line.badge}
                  </span>
                </div>
              );
            }
            if (line.kind === 'prompt') {
              return (
                <div key={i} className="mt-1 text-zinc-400">{line.text}</div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
