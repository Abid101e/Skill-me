import { notFound } from 'next/navigation';
import { getIndexData, getStack, getAllStacks, CATEGORY_STYLE, CATEGORY_ORDER } from '@/lib/data';
import PluginCard from '@/components/PluginCard';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ stack: string }>;
}

export async function generateStaticParams() {
  try {
    const data = await getIndexData();
    return Object.keys(data.recommendations).map(id => ({ stack: encodeURIComponent(id) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stack: raw } = await params;
  try {
    const data = await getIndexData();
    const info = getStack(data, decodeURIComponent(raw));
    if (!info) return { title: 'Stack not found — skillme' };
    return {
      title: `${info.displayName} plugins — skillme`,
      description: `${info.plugins.length} Claude Code plugins recommended for ${info.displayName} projects.`,
    };
  } catch {
    return { title: 'skillme' };
  }
}

export default async function StackPage({ params }: Props) {
  const { stack: raw } = await params;
  const stackId = decodeURIComponent(raw);

  const data = await getIndexData().catch(() => null);
  if (!data) notFound();

  const info = getStack(data, stackId);
  if (!info) notFound();

  const style = CATEGORY_STYLE[info.category] ?? CATEGORY_STYLE['Meta'];

  // Related stacks: same category, excluding this one
  const allStacks = getAllStacks(data);
  const related = allStacks.filter(
    s => s.category === info.category && s.id !== info.id,
  );

  // Prev / next in CATEGORY_ORDER for navigation
  const categoryOrder = CATEGORY_ORDER;
  const sameCategory = allStacks
    .filter(s => s.category === info.category)
    .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
  const idx       = sameCategory.findIndex(s => s.id === info.id);
  const prevStack = sameCategory[idx - 1] ?? null;
  const nextStack = sameCategory[idx + 1] ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* background glow — category color */}
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: `rgba(${info.rgbaColor}, 1)` }}
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
          <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 md:px-12">

            {/* ── Breadcrumb ── */}
            <div className="mb-8 flex items-center gap-2 font-mono text-xs text-zinc-600">
              <a href="/stacks" className="transition-colors hover:text-emerald-400">
                ← stacks
              </a>
              <span>/</span>
              <span className="text-zinc-400">{info.displayName}</span>
            </div>

            {/* ── Hero ── */}
            <div className="mb-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h1
                  className="font-mono text-3xl font-bold text-white sm:text-4xl"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {info.displayName}
                </h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest ${style.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {info.category}
                </span>
              </div>
              <p className="text-zinc-400">
                {info.plugins.length} plugin{info.plugins.length !== 1 ? 's' : ''} recommended for{' '}
                <span className="text-white">{info.displayName}</span> projects.
              </p>
            </div>

            {/* ── Plugin grid ── */}
            {info.plugins.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {info.plugins.map(plugin => (
                  <div key={plugin.name} className="h-full">
                    <PluginCard plugin={plugin} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-zinc-600">
                No plugins found for this stack.
              </p>
            )}

            {/* ── Related stacks ── */}
            {related.length > 0 && (
              <div className="mt-16">
                <p className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600">
                  Other {info.category} stacks
                </p>
                <div className="flex flex-wrap gap-2">
                  {related.map(s => (
                    <a
                      key={s.id}
                      href={`/stacks/${encodeURIComponent(s.id)}`}
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/3 px-4 py-2 font-mono text-sm text-zinc-300 transition-all hover:border-white/20 hover:text-white`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {s.displayName}
                      <span className="ml-1 text-xs text-zinc-600">{s.plugins.length}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── Prev / Next navigation ── */}
            {(prevStack || nextStack) && (
              <div className="mt-12 flex items-center justify-between border-t border-white/6 pt-8">
                {prevStack ? (
                  <a
                    href={`/stacks/${encodeURIComponent(prevStack.id)}`}
                    className="group flex flex-col"
                  >
                    <span className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400 transition-colors">← previous</span>
                    <span className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors">{prevStack.displayName}</span>
                  </a>
                ) : <div />}
                {nextStack ? (
                  <a
                    href={`/stacks/${encodeURIComponent(nextStack.id)}`}
                    className="group flex flex-col items-end"
                  >
                    <span className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400 transition-colors">next →</span>
                    <span className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors">{nextStack.displayName}</span>
                  </a>
                ) : <div />}
              </div>
            )}

          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/6 px-4 py-8 sm:px-6 md:px-12">
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
