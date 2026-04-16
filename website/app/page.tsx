import { getIndexData, getFeaturedPlugins, getStats } from '@/lib/data';
import PluginCard from '@/components/PluginCard';
import CopyCommand from '@/components/CopyCommand';

export default async function Home() {
  let data;
  try {
    data = await getIndexData();
  } catch {
    data = null;
  }

  const featured = data ? getFeaturedPlugins(data) : [];
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
        <nav className="flex items-center justify-between px-6 py-5 md:px-12">
          <span className="font-mono text-lg font-semibold text-white">
            skill<span style={{ color: '#10b981' }}>me</span>
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Abid101e/Skill-me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/skillme"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 transition-all hover:border-emerald-500/50 hover:text-white"
            >
              npm
            </a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="mx-auto max-w-4xl px-6 pb-24 pt-20 text-center md:px-12 md:pt-28">

          {/* badge */}
          <div className="fade-up fade-up-1 mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400">
              v0.1.1 · {stats.plugins}+ plugins live
            </span>
          </div>

          {/* headline */}
          <h1
            className="fade-up fade-up-2 mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl"
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
          <div className="fade-up fade-up-5 mt-16 flex items-center justify-center gap-10 border-t border-white/6 pt-10">
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

        {/* ── HOW IT WORKS ── */}
        <section className="mx-auto max-w-4xl px-6 pb-24 md:px-12">
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
        <section className="mx-auto max-w-6xl px-6 pb-32 md:px-12">
          <div className="mb-10 flex items-end justify-between">
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
            <span className="hidden font-mono text-xs text-zinc-600 sm:block">
              {stats.plugins}+ total in index
            </span>
          </div>

          {featured.length > 0 ? (
            <div className="card-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map(plugin => (
                <div key={plugin.name} className="fade-up">
                  <PluginCard plugin={plugin} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-600">
              Loading plugins...
            </p>
          )}
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/6 px-6 py-8 md:px-12">
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
