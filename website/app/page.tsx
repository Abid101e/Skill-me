import { getIndexData, getFeaturedPlugins, getCommunityPlugins, getStats } from '@/lib/data';
import PluginCard from '@/components/PluginCard';
import CopyCommand from '@/components/CopyCommand';
import Terminal from '@/components/Terminal';

export default async function Home() {
  let data;
  try {
    data = await getIndexData();
  } catch {
    data = null;
  }

  const featured = data ? getFeaturedPlugins(data) : [];
  const community = data ? getCommunityPlugins(data) : [];
  const stats = data ? getStats(data) : { plugins: 167, marketplaces: 4, trusted: 18 };

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* background orbs */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-150 w-225 rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-100 w-100 rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)' }}
      />

      <div className="relative z-10">

        {/* ── NAV ── */}
        <nav className="flex items-center justify-between px-4 py-5 sm:px-6 md:px-12">
          <span className="font-mono text-lg font-semibold text-white">
            skill<span style={{ color: '#10b981' }}>me</span>
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/plugins" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Plugins
            </a>
            <a href="/stacks" className="text-sm text-zinc-400 transition-colors hover:text-white">
              Stacks
            </a>
            <a
              href="https://github.com/Abid101e/Skill-me"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-all hover:border-emerald-500/50 hover:text-white sm:px-4"
            >
              GitHub
            </a>
          </div>
        </nav>

        <main>
        {/* ── HERO ── */}
        <section className="mx-auto max-w-4xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-20 md:px-12 md:pt-28">

          {/* badge */}
          <div className="fade-up fade-up-1 mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400">
              v0.1.1 · {stats.plugins}+ plugins live
            </span>
          </div>

          {/* headline */}
          <h1
            className="fade-up fade-up-2 mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-7xl"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            The missing plugin{' '}
            <span
              className="block"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              manager for Claude
            </span>
          </h1>

          {/* subtext */}
          <p className="fade-up fade-up-3 mx-auto mb-10 max-w-xl text-lg leading-relaxed text-zinc-400">
            Detects your project stack and installs the right Claude Code plugins
            in one command. Search across {stats.marketplaces} marketplaces, install, update, and manage — all from the terminal.
          </p>

          {/* cta */}
          <div className="fade-up fade-up-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CopyCommand command="npm install -g skillme" />
            <CopyCommand command="skillme init" />
          </div>

          {/* stats */}
          <div className="fade-up fade-up-5 mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-white/6 pt-8 sm:mt-16 sm:gap-10 sm:pt-10">
            {[
              { value: `${stats.plugins}+`, label: 'Plugins' },
              { value: `${stats.marketplaces}`, label: 'Marketplaces' },
              { value: `${stats.trusted}`, label: 'Official' },
              { value: '6', label: 'Commands' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {s.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TERMINAL DEMO ── */}
        <section className="mx-auto max-w-2xl px-4 pb-20 sm:px-6 sm:pb-24 md:px-12">
          <p className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-zinc-600">
            See it in action
          </p>
          <Terminal />
        </section>

        {/* ── BROWSE BY STACK CTA ── */}
        <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 sm:pb-24 md:px-12">
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-8 sm:p-10 text-center">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(ellipse at 60% 0%, #6366f1 0%, transparent 60%)' }}
            />
            <div className="relative">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-violet-400">
                New
              </p>
              <h2 className="mb-3 text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Browse by Stack
              </h2>
              <p className="mb-6 text-sm text-zinc-400">
                React, Python, Go, Docker and more — see exactly which plugins are recommended for your tech.
              </p>
              <a
                href="/stacks"
                className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 font-mono text-sm text-violet-300 transition-all hover:border-violet-500/60 hover:bg-violet-500/20 hover:text-white"
              >
                Explore stacks →
              </a>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 sm:pb-24 md:px-12">
          <h2
            className="mb-10 text-center text-2xl font-bold text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            How it works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Detect',
                desc: 'Scans your project for frameworks, languages, and tooling.',
              },
              {
                step: '02',
                title: 'Recommend',
                desc: 'Matches your stack to the best plugins across all marketplaces.',
              },
              {
                step: '03',
                title: 'Install',
                desc: 'One command installs everything into your chosen scope.',
              },
            ].map(item => (
              <div
                key={item.step}
                className="rounded-xl border border-white/7 bg-white/3 p-6"
              >
                <div className="mb-3 font-mono text-xs font-semibold text-emerald-500">
                  {item.step}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURED PLUGINS ── */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32 md:px-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Featured Plugins
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Official, trusted plugins recommended for most projects
              </p>
            </div>
            <a
              href="/plugins"
              className="hidden font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400 sm:block"
            >
              View all {stats.plugins}+ →
            </a>
          </div>

          {featured.length > 0 ? (
            <div className="card-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map(plugin => (
                <div key={plugin.name} className="fade-up h-full">
                  <PluginCard plugin={plugin} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-600">
              Unable to load plugins — try refreshing.
            </p>
          )}
        </section>

        {/* ── COMMUNITY PICKS ── */}
        {community.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32 md:px-12">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  Community Picks
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Popular plugins from the community marketplace
                </p>
              </div>
              <a
                href="/plugins?filter=community"
                className="hidden font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400 sm:block"
              >
                Browse all {stats.plugins - stats.trusted}+ →
              </a>
            </div>
            <div className="card-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {community.map(plugin => (
                <div key={plugin.name} className="fade-up h-full">
                  <PluginCard plugin={plugin} />
                </div>
              ))}
            </div>
          </section>
        )}

        </main>
        {/* ── FOOTER ── */}
        <footer className="border-t border-white/6 px-4 py-8 sm:px-6 md:px-12">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="font-mono text-sm text-zinc-600">
              skill<span style={{ color: '#10b981' }}>me</span> · MIT License
            </span>
            <div className="flex gap-5 text-sm text-zinc-600">
              <a
                href="https://github.com/Abid101e/Skill-me"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/skillme"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                npm
              </a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
