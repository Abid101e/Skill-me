import { notFound } from 'next/navigation';
import { getIndexData, findPlugin, getStacksForPlugin } from '@/lib/data';
import CopyCommand from '@/components/CopyCommand';
import type { Metadata } from 'next';

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
    return {
      title: `${plugin.name} — skillme`,
      description: plugin.description.split('\n')[0].slice(0, 160),
    };
  } catch {
    return { title: 'skillme' };
  }
}

export default async function PluginPage({ params }: Props) {
  const { name } = await params;
  const pluginName = decodeURIComponent(name);

  const data = await getIndexData().catch(() => null);
  if (!data) notFound();

  const plugin = findPlugin(data, pluginName);
  if (!plugin) notFound();

  const stacks = getStacksForPlugin(data, pluginName);

  const shortDesc = plugin.description
    .split('\n')[0]
    .replace(/[#*`>_~]/g, '')
    .trim();

  const fullDesc = plugin.description
    .replace(/[#*`>_~]/g, '')
    .trim();

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* background glow */}
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: plugin.trusted ? '#10b981' : '#f59e0b' }}
      />

      <div className="relative z-10">

        {/* ── NAV ── */}
        <nav className="flex items-center justify-between px-4 py-5 sm:px-6 md:px-12">
          <a href="/" className="font-mono text-lg font-semibold text-white">
            skill<span style={{ color: '#10b981' }}>me</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/plugins" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Plugins
            </a>
            <a href="/stacks" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Stacks
            </a>
            <a href="https://github.com/Abid101e/Skill-me" target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-all hover:border-emerald-500/50 hover:text-white sm:px-4">
              GitHub
            </a>
          </div>
        </nav>

        <main>
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6 md:px-12">

          {/* ── Breadcrumb ── */}
          <div className="mb-8 flex items-center gap-2 font-mono text-xs text-zinc-600">
            <a href="/plugins" className="transition-colors hover:text-emerald-400">
              ← plugins
            </a>
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
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                plugin.trusted
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
              }`}>
                {plugin.trusted ? 'official' : 'community'}
              </span>
            </div>
            <p className="text-lg leading-relaxed text-zinc-300">{shortDesc}</p>
          </div>

          {/* ── Install command ── */}
          <div className="mb-10">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">Install</p>
            <CopyCommand command={`skillme install ${plugin.name}`} />
          </div>

          {/* ── Details grid ── */}
          <div className="grid gap-8 md:grid-cols-3">

            {/* Left — main info */}
            <div className="space-y-8 md:col-span-2">

              {/* Full description (if multi-line) */}
              {fullDesc.length > shortDesc.length && (
                <div>
                  <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">Description</p>
                  <p className="leading-relaxed text-zinc-400 whitespace-pre-line">{fullDesc}</p>
                </div>
              )}

              {/* Tags */}
              {plugin.tags.length > 0 && (
                <div>
                  <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {plugin.tags.map((tag: string) => (
                      <a
                        key={tag}
                        href={`/plugins?tag=${encodeURIComponent(tag)}`}
                        className="rounded-md border border-white/8 bg-white/4 px-3 py-1 font-mono text-xs text-zinc-400 transition-all hover:border-emerald-500/30 hover:text-emerald-400"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended for stacks */}
              {stacks.length > 0 && (
                <div>
                  <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-600">
                    Recommended for
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stacks.map(stack => (
                      <span
                        key={stack}
                        className="rounded-md border border-white/8 bg-white/3 px-3 py-1 font-mono text-xs text-zinc-400"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — metadata sidebar */}
            <div className="space-y-6 rounded-xl border border-white/8 bg-white/3 p-5 self-start">
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Type</p>
                <p className={`text-sm font-medium ${plugin.trusted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {plugin.trusted ? 'Official' : 'Community'}
                </p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Marketplace</p>
                <p className="font-mono text-sm text-zinc-300">{plugin.marketplace}</p>
              </div>
              {plugin.requiresBinary && (
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Requires</p>
                  <p className="font-mono text-sm text-amber-400">{plugin.requiresBinary}</p>
                </div>
              )}
              <div className="border-t border-white/6 pt-4">
                <a
                  href={`/plugins`}
                  className="block text-center font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400"
                >
                  ← Browse all plugins
                </a>
              </div>
            </div>

          </div>
        </div>

        </main>
        {/* ── FOOTER ── */}
        <footer className="border-t border-white/6 px-4 py-8 sm:px-6 md:px-12">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
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
