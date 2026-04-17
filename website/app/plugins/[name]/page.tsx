import { notFound } from 'next/navigation';
import {
  getIndexData, findPlugin, getStacksForPlugin,
  getRelatedPlugins, getMarketplace, STACK_META,
} from '@/lib/data';
import CopyCommand from '@/components/CopyCommand';
import type { Metadata } from 'next';
import type { Plugin } from '@/lib/types';

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  try {
    const data = await getIndexData();
    return Object.keys(data.plugins).map(name => ({ name: encodeURIComponent(name) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  try {
    const data   = await getIndexData();
    const plugin = findPlugin(data, decodeURIComponent(name));
    if (!plugin) return { title: 'Plugin not found — skillme' };
    const desc = plugin.description.split('\n')[0].replace(/[#*`>_~]/g, '').trim();
    return {
      title: `${plugin.name} — skillme`,
      description: desc.slice(0, 160),
    };
  } catch {
    return { title: 'skillme' };
  }
}

// ── Description renderer ──────────────────────────────────────────────────────

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\/[\w][\w-]*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (/^\/[\w]/.test(part)) {
          return (
            <code key={i} className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-xs text-emerald-400">
              {part}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function DescriptionBlock({ text }: { text: string }) {
  const isPlaceholder = /^Plugin from /i.test(text.trim());
  if (isPlaceholder) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-4">
      {paragraphs.map((para, pi) => {
        const lines = para.trim().split('\n');
        const isHeading = lines[0].startsWith('#');
        const isAllList = lines.every(l => /^[-*]\s/.test(l.trim()) || l.trim() === '');

        if (isHeading) {
          return (
            <div key={pi}>
              <p className="mb-2 font-semibold text-white">
                {lines[0].replace(/^#+\s*/, '')}
              </p>
              {lines.slice(1).length > 0 && (
                <p className="text-sm leading-relaxed text-zinc-400">
                  <InlineText text={lines.slice(1).join(' ')} />
                </p>
              )}
            </div>
          );
        }

        if (isAllList) {
          return (
            <ul key={pi} className="space-y-1.5">
              {lines.filter(l => l.trim()).map((l, li) => (
                <li key={li} className="flex gap-2 text-sm leading-relaxed text-zinc-400">
                  <span className="mt-1 shrink-0 text-emerald-500">→</span>
                  <InlineText text={l.replace(/^[-*]\s*/, '')} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={pi} className="text-sm leading-relaxed text-zinc-400">
            <InlineText text={lines.join(' ')} />
          </p>
        );
      })}
    </div>
  );
}

// ── Related plugin card ───────────────────────────────────────────────────────

function RelatedCard({ plugin }: { plugin: Plugin }) {
  const shortDesc = plugin.description
    .split('\n')[0]
    .replace(/[#*`>_~]/g, '')
    .trim()
    .slice(0, 60);
  const isPlaceholder = /^Plugin from /i.test(shortDesc);

  return (
    <a
      href={`/plugins/${encodeURIComponent(plugin.name)}`}
      className="group flex flex-col gap-1.5 rounded-xl border border-white/8 bg-white/3 p-4 transition-all hover:border-white/16 hover:bg-white/5"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
          {plugin.name}
        </span>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
          plugin.trusted
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-amber-500/10 text-amber-500'
        }`}>
          {plugin.trusted ? 'official' : 'community'}
        </span>
      </div>
      {!isPlaceholder && (
        <p className="text-xs text-zinc-500 leading-relaxed">{shortDesc}{shortDesc.length === 60 ? '…' : ''}</p>
      )}
    </a>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PluginPage({ params }: Props) {
  const { name } = await params;
  const pluginName = decodeURIComponent(name);

  const data = await getIndexData().catch(() => null);
  if (!data) notFound();

  const plugin = findPlugin(data, pluginName);
  if (!plugin) notFound();

  const stacks    = getStacksForPlugin(data, pluginName);
  const related   = getRelatedPlugins(data, plugin);
  const mkt       = getMarketplace(data, plugin.marketplace);
  const sourceUrl = mkt ? `https://github.com/${mkt.repo}/tree/main/${plugin.name}` : null;
  const issuesUrl = mkt ? `https://github.com/${mkt.repo}/issues` : null;
  const mktUrl    = mkt ? `https://github.com/${mkt.repo}` : null;

  const shortDesc = plugin.description
    .split('\n')[0]
    .replace(/[#*`>_~]/g, '')
    .trim();
  const isPlaceholder = /^Plugin from /i.test(shortDesc);

  const glowColor = plugin.trusted ? '16,185,129' : '245,158,11';

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Glow */}
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full opacity-8 blur-3xl"
        style={{ background: `radial-gradient(ellipse, rgba(${glowColor},0.6) 0%, transparent 70%)` }}
      />

      <div className="relative z-10">

        {/* ── NAV ──────────────────────────────────────────────────── */}
        <nav className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <a href="/" className="font-mono text-lg font-semibold text-white">
            skill<span style={{ color: '#10b981' }}>me</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/plugins" className="text-sm text-zinc-400 transition-colors hover:text-white">Plugins</a>
            <a href="/stacks"  className="text-sm text-zinc-400 transition-colors hover:text-white">Stacks</a>
            <a href="/docs"    className="text-sm text-zinc-400 transition-colors hover:text-white">Docs</a>
            <a
              href="https://github.com/Abid101e/Skill-me"
              target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-all hover:border-emerald-500/50 hover:text-white sm:px-4"
            >
              GitHub
            </a>
          </div>
        </nav>

        <main>
          <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">

            {/* ── Breadcrumb ── */}
            <div className="mb-8 flex items-center gap-2 font-mono text-xs text-zinc-600">
              <a href="/plugins" className="transition-colors hover:text-emerald-400">← plugins</a>
              <span>/</span>
              <span className="text-zinc-400">{plugin.name}</span>
            </div>

            {/* ── Hero ── */}
            <div className="mb-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h1
                  className="font-mono text-3xl font-bold text-white sm:text-4xl"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {plugin.name}
                </h1>
                <span className={`rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest ${
                  plugin.trusted
                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/25 bg-amber-500/10 text-amber-400'
                }`}>
                  {plugin.trusted ? 'official' : 'community'}
                </span>
              </div>

              <p className="mb-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
                {isPlaceholder ? 'No description available — view the source for details.' : shortDesc}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <CopyCommand command={`skillme install ${plugin.name}`} />
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-3.5 font-mono text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white sm:w-auto"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 text-zinc-500">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    View source
                    <span className="text-zinc-600">↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* ── Main grid ── */}
            <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">

              {/* ── Left column ── */}
              <div className="space-y-10">

                {/* Description */}
                {!isPlaceholder && plugin.description.trim().length > shortDesc.length && (
                  <section>
                    <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-zinc-600">About</p>
                    <DescriptionBlock text={plugin.description} />
                  </section>
                )}

                {/* What it can do (commands extracted) */}
                {plugin.description.includes('/') && (
                  <section>
                    <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-zinc-600">
                      Commands
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(plugin.description.matchAll(/\/[\w][\w-]*/g))
                        .map(m => m[0])
                        .filter((cmd, i, arr) => arr.indexOf(cmd) === i)
                        .map(cmd => (
                          <span
                            key={cmd}
                            className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 font-mono text-xs text-emerald-400"
                          >
                            {cmd}
                          </span>
                        ))}
                    </div>
                  </section>
                )}

                {/* Tags */}
                {plugin.tags.length > 0 && (
                  <section>
                    <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-zinc-600">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {plugin.tags.map((tag: string) => (
                        <a
                          key={tag}
                          href={`/plugins?tag=${encodeURIComponent(tag)}`}
                          className="rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400"
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Recommended for */}
                {stacks.length > 0 && (
                  <section>
                    <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-zinc-600">
                      Recommended for
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {stacks.map(stack => {
                        const meta = STACK_META[stack];
                        return (
                          <a
                            key={stack}
                            href={`/stacks/${encodeURIComponent(stack)}`}
                            className="rounded-lg border border-white/8 bg-white/3 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-all hover:border-white/16 hover:text-white"
                          >
                            {meta?.displayName ?? stack}
                          </a>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Related plugins */}
                {related.length > 0 && (
                  <section>
                    <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-zinc-600">
                      Related plugins
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {related.map(p => <RelatedCard key={p.name} plugin={p} />)}
                    </div>
                  </section>
                )}
              </div>

              {/* ── Right sidebar ── */}
              <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">

                {/* Source */}
                {sourceUrl && (
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Source</p>
                    <a
                      href={sourceUrl}
                      target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      <span className="min-w-0 truncate font-mono text-xs">
                        {mkt?.repo}/{plugin.name}
                      </span>
                      <span className="ml-auto shrink-0 text-zinc-700 transition-colors group-hover:text-emerald-500">↗</span>
                    </a>
                  </div>
                )}

                {/* Marketplace */}
                {mkt && (
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Marketplace</p>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                        mkt.trusted
                          ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-400'
                          : 'border-amber-500/25 bg-amber-500/8 text-amber-400'
                      }`}>
                        {mkt.trusted ? 'official' : 'community'}
                      </span>
                      <span className="font-mono text-xs text-zinc-300">{mkt.id}</span>
                    </div>
                    <p className="mb-3 text-xs leading-relaxed text-zinc-500">{mkt.description}</p>
                    {mktUrl && (
                      <a
                        href={mktUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="font-mono text-xs text-zinc-600 transition-colors hover:text-emerald-400"
                      >
                        View on GitHub →
                      </a>
                    )}
                  </div>
                )}

                {/* Install options */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Install</p>
                  <div className="flex w-full flex-col gap-2">
                    <CopyCommand command={`skillme install ${plugin.name}`} noTruncate />
                    <CopyCommand command={`skillme install ${plugin.name} --scope project`} noTruncate />
                    <CopyCommand command={`skillme install ${plugin.name} --scope local`} noTruncate />
                  </div>
                  <p className="mt-3 text-[10px] leading-relaxed text-zinc-700">
                    Default scope is <span className="font-mono text-zinc-600">user</span>. Use{' '}
                    <span className="font-mono text-zinc-600">project</span> to share with your team.
                  </p>
                </div>

                {/* Requires binary */}
                {plugin.requiresBinary && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-amber-600">
                      Requires binary
                    </p>
                    <p className="font-mono text-sm text-amber-400">{plugin.requiresBinary}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Install this tool before using the plugin.
                    </p>
                  </div>
                )}

                {/* Discuss / links */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Links</p>
                  <div className="space-y-2">
                    {issuesUrl && (
                      <a
                        href={issuesUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between text-xs text-zinc-500 transition-colors hover:text-white"
                      >
                        <span>Discuss on GitHub</span>
                        <span className="text-zinc-700">↗</span>
                      </a>
                    )}
                    <a
                      href="/docs"
                      className="flex items-center justify-between text-xs text-zinc-500 transition-colors hover:text-white"
                    >
                      <span>skillme docs</span>
                      <span className="text-zinc-700">→</span>
                    </a>
                    <a
                      href="/plugins"
                      className="flex items-center justify-between text-xs text-zinc-500 transition-colors hover:text-white"
                    >
                      <span>Browse all plugins</span>
                      <span className="text-zinc-700">→</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <a href="/" className="font-mono text-sm text-zinc-600 transition-colors hover:text-white">
              skill<span style={{ color: '#10b981' }}>me</span>
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
