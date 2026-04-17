'use client';

import { useState, useEffect, type ReactNode } from 'react';
import CopyCommand from './CopyCommand';

// ── Navigation structure ───────────────────────────────────────────────────────

const NAV = [
  {
    group: 'Getting Started',
    items: [
      { id: 'installation', label: 'Installation' },
      { id: 'quick-start', label: 'Quick Start' },
    ],
  },
  {
    group: 'Commands',
    items: [
      { id: 'cmd-init', label: 'init' },
      { id: 'cmd-search', label: 'search' },
      { id: 'cmd-install', label: 'install' },
      { id: 'cmd-list', label: 'list' },
      { id: 'cmd-upgrade', label: 'upgrade' },
      { id: 'cmd-doctor', label: 'doctor' },
      { id: 'cmd-sync', label: 'sync' },
      { id: 'cmd-uninstall', label: 'uninstall' },
      { id: 'cmd-info', label: 'info' },
      { id: 'cmd-update', label: 'update' },
    ],
  },
  {
    group: 'Features',
    items: [
      { id: 'stack-detection', label: 'Stack Detection' },
      { id: 'ai-mode', label: 'AI Mode' },
      { id: 'team-sync', label: 'Team Sync' },
      { id: 'scopes', label: 'Scopes' },
    ],
  },
];

// ── Small UI components ────────────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      className="ml-2 font-mono text-base text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 hover:text-emerald-500"
      aria-hidden
    >
      #
    </a>
  );
}

function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="group mb-4 flex scroll-mt-8 items-baseline text-2xl font-bold text-white"
      style={{ fontFamily: 'Syne, sans-serif' }}
    >
      {children}
      <SectionAnchor id={id} />
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </h3>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="mb-5 text-sm leading-relaxed text-zinc-400">{children}</p>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-white/6 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mb-5 overflow-x-auto rounded-xl border border-white/8 bg-white/3 p-4 font-mono text-xs leading-relaxed text-zinc-300">
      {children}
    </pre>
  );
}

function OptionRow({ flag, desc, def }: { flag: string; desc: string; def?: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 py-2.5 last:border-0 sm:flex-row sm:gap-4">
      <code className="w-full shrink-0 font-mono text-xs text-emerald-400 sm:w-56">{flag}</code>
      <span className="text-sm text-zinc-400">
        {desc}
        {def && <span className="ml-2 font-mono text-xs text-zinc-600">default: {def}</span>}
      </span>
    </div>
  );
}

function Callout({ type, children }: { type: 'tip' | 'note' | 'new'; children: ReactNode }) {
  const styles = {
    tip:  { border: 'border-emerald-500/25', bg: 'bg-emerald-500/5',  dot: 'bg-emerald-400', label: 'TIP',  text: 'text-emerald-300' },
    note: { border: 'border-amber-500/25',   bg: 'bg-amber-500/5',    dot: 'bg-amber-400',   label: 'NOTE', text: 'text-amber-300' },
    new:  { border: 'border-violet-500/25',  bg: 'bg-violet-500/5',   dot: 'bg-violet-400',  label: 'NEW',  text: 'text-violet-300' },
  }[type];

  return (
    <div className={`mb-5 flex gap-3 rounded-xl border ${styles.border} ${styles.bg} px-4 py-3`}>
      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
      <div className="text-sm leading-relaxed text-zinc-400">
        <span className={`mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest ${styles.text}`}>
          {styles.label}
        </span>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="my-12 border-t border-white/6" />;
}

function CommandBadge({ name }: { name: string }) {
  return (
    <span className="mb-4 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 font-mono text-xs text-emerald-400">
      skillme {name}
    </span>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
  return (
    <nav className="py-12 pr-6">
      {NAV.map((group) => (
        <div key={group.group} className="mb-6">
          <div className="mb-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            {group.group}
          </div>
          {group.items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                active === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

// ── Main docs content ──────────────────────────────────────────────────────────

function DocsContent() {
  return (
    <div className="py-12 pl-0 lg:pl-10 xl:pl-16">

      {/* Page header */}
      <div className="mb-12">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-emerald-500">
          Documentation
        </div>
        <h1
          className="mb-3 text-4xl font-extrabold text-white sm:text-5xl"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          skillme docs
        </h1>
        <p className="max-w-xl text-zinc-400">
          The missing plugin manager for Claude Code. Detect your stack, install the right plugins,
          and keep your whole team in sync.
        </p>
      </div>

      {/* ── INSTALLATION ──────────────────────────────────────────── */}
      <H2 id="installation">Installation</H2>
      <Prose>Install skillme globally via npm. Requires Node.js 18+ and the Claude Code CLI.</Prose>
      <div className="mb-5 flex flex-col gap-3">
        <CopyCommand command="npm install -g skillme" />
        <CopyCommand command="skillme --version" />
      </div>
      <Callout type="note">
        Claude Code must be installed first.{' '}
        <a
          href="https://claude.ai/download"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-300 underline underline-offset-2 hover:text-white"
        >
          Download Claude Code →
        </a>
      </Callout>

      <Divider />

      {/* ── QUICK START ───────────────────────────────────────────── */}
      <H2 id="quick-start">Quick Start</H2>
      <Prose>
        Run <Code>skillme init</Code> inside any project directory. skillme detects your stack,
        fetches plugin recommendations, and shows an interactive picker.
      </Prose>
      <CopyCommand command="cd my-project && skillme init" />
      <CodeBlock>{`◆  skillme — Claude Code plugin manager
│
◇  Stack detected
│  → React, TypeScript, Tailwind
│
◇  Plugin index ready
│
◆  Select plugins to install (space to toggle, enter to confirm):
│  ● commit-commands    official
│  ● code-review        official
│  ○ react-patterns     community
│  ○ tanstack-query     community
│
◇  Install scope:
│  ● project  shared with team via .claude/settings.json
│  ○ user     only you, across all projects
│  ○ local    only you, this project, gitignored
│
◆  2 plugin(s) installed. Run /reload-plugins in Claude Code to activate.`}
      </CodeBlock>

      <Divider />

      {/* ── INIT ──────────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="init" />
      </div>
      <H2 id="cmd-init">init</H2>
      <Prose>
        Detects your project stack and installs recommended plugins. Runs an interactive
        multiselect — official plugins are pre-selected, community plugins are opt-in.
      </Prose>
      <div className="mb-5 flex flex-col gap-2">
        <CopyCommand command="skillme init" />
        <CopyCommand command="skillme init --scope user" />
        <CopyCommand command="skillme init --ai" />
      </div>
      <H3>Options</H3>
      <div className="mb-5 rounded-xl border border-white/6 px-4">
        <OptionRow flag="-s, --scope <scope>" desc="Install scope: user | project | local" def="project" />
        <OptionRow flag="--ai" desc="Use Claude to analyze your project for smarter, project-specific recommendations" />
      </div>
      <Callout type="tip">
        Use <Code>skillme init --ai</Code> for recommendations that reference your actual
        dependencies and git history. See <a href="#ai-mode" className="text-emerald-400 hover:underline">AI Mode</a>.
      </Callout>

      <Divider />

      {/* ── SEARCH ────────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="search" />
      </div>
      <H2 id="cmd-search">search</H2>
      <Prose>Search for plugins by name or keyword across all marketplaces.</Prose>
      <div className="mb-5 flex flex-col gap-2">
        <CopyCommand command="skillme search react" />
        <CopyCommand command="skillme search typescript --scope project" />
      </div>
      <H3>Options</H3>
      <div className="mb-5 rounded-xl border border-white/6 px-4">
        <OptionRow flag="-s, --scope <scope>" desc="Scope for installation from the picker" def="user" />
      </div>

      <Divider />

      {/* ── INSTALL ───────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="install" />
      </div>
      <H2 id="cmd-install">install</H2>
      <Prose>Install a specific plugin by name, optionally pinning the marketplace.</Prose>
      <div className="mb-5 flex flex-col gap-2">
        <CopyCommand command="skillme install commit-commands" />
        <CopyCommand command="skillme install code-review --scope project" />
        <CopyCommand command="skillme install php-lsp --marketplace claude-plugins-official" />
      </div>
      <H3>Options</H3>
      <div className="mb-5 rounded-xl border border-white/6 px-4">
        <OptionRow flag="-s, --scope <scope>"     desc="Install scope: user | project | local" def="user" />
        <OptionRow flag="-m, --marketplace <id>"  desc="Specify which marketplace to install from" />
      </div>

      <Divider />

      {/* ── LIST ──────────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="list" />
      </div>
      <H2 id="cmd-list">list</H2>
      <Prose>
        Show all installed plugins across every scope, with descriptions fetched from the live index.
      </Prose>
      <CopyCommand command="skillme list" />
      <CodeBlock>{`  user scope
  ✓ commit-commands
    Adds slash commands for writing conventional commits

  project scope
  ✓ code-review
    Adds a /review command that reviews open changes`}
      </CodeBlock>

      <Divider />

      {/* ── UPGRADE ───────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="upgrade" />
      </div>
      <H2 id="cmd-upgrade">upgrade</H2>
      <Prose>
        Re-installs all currently installed plugins to pick up the latest versions.
        Prompts for confirmation before proceeding.
      </Prose>
      <CopyCommand command="skillme upgrade" />

      <Divider />

      {/* ── DOCTOR ────────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="doctor" />
      </div>
      <H2 id="cmd-doctor">doctor</H2>
      <Prose>
        Checks your environment for issues that could prevent plugins from working correctly.
      </Prose>
      <CopyCommand command="skillme doctor" />
      <H3>Checks</H3>
      <div className="mb-5 rounded-xl border border-white/6 px-4">
        <OptionRow flag="Node.js version"         desc="Must be ≥ 18.0.0" />
        <OptionRow flag="Claude CLI"              desc="Installed and accessible in PATH" />
        <OptionRow flag="Plugin binaries"         desc="Any required external tools (e.g. language servers)" />
        <OptionRow flag="Settings file integrity" desc="Valid JSON in all .claude/settings*.json files" />
      </div>

      <Divider />

      {/* ── SYNC ──────────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="sync" />
        <span className="ml-2 rounded-full border border-violet-500/30 bg-violet-500/8 px-2 py-0.5 font-mono text-[10px] text-violet-400">
          team feature
        </span>
      </div>
      <H2 id="cmd-sync">sync</H2>
      <Prose>
        Saves your project plugin setup to a <Code>skillme.json</Code> lockfile and installs from it.
        Commit the lockfile so teammates get identical plugins with one command.
      </Prose>
      <H3>First time — create the lockfile</H3>
      <div className="mb-5 flex flex-col gap-2">
        <CopyCommand command="skillme sync" />
        <CopyCommand command='git add skillme.json && git commit -m "add skillme config"' />
      </div>
      <H3>Teammate — install from lockfile</H3>
      <div className="mb-5 flex flex-col gap-2">
        <CopyCommand command="git pull" />
        <CopyCommand command="skillme sync" />
      </div>
      <H3>Update lockfile after adding plugins</H3>
      <div className="mb-5 flex flex-col gap-2">
        <CopyCommand command="skillme install some-plugin --scope project" />
        <CopyCommand command="skillme sync --save" />
      </div>
      <H3>Options</H3>
      <div className="mb-5 rounded-xl border border-white/6 px-4">
        <OptionRow flag="--save" desc="Force-overwrite skillme.json with current project-scope plugins" />
      </div>
      <Callout type="tip">
        Only <strong>project-scope</strong> plugins are written to the lockfile. User-scope and
        local-scope plugins remain personal.
      </Callout>

      <Divider />

      {/* ── UNINSTALL ─────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="uninstall" />
      </div>
      <H2 id="cmd-uninstall">uninstall</H2>
      <Prose>
        Remove an installed plugin. Without a name, shows an interactive picker of all
        installed plugins.
      </Prose>
      <div className="mb-5 flex flex-col gap-2">
        <CopyCommand command="skillme uninstall commit-commands" />
        <CopyCommand command="skillme uninstall" />
      </div>

      <Divider />

      {/* ── INFO ──────────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="info" />
      </div>
      <H2 id="cmd-info">info</H2>
      <Prose>Show full details for a plugin — description, marketplace, tags, and install command.</Prose>
      <CopyCommand command="skillme info commit-commands" />

      <Divider />

      {/* ── UPDATE ────────────────────────────────────────────────── */}
      <div className="mb-2">
        <CommandBadge name="update" />
      </div>
      <H2 id="cmd-update">update</H2>
      <Prose>
        Refresh the marketplace plugin index from GitHub. skillme caches the index locally;
        run this to pick up newly published plugins.
      </Prose>
      <CopyCommand command="skillme update" />

      <Divider />

      {/* ── STACK DETECTION ───────────────────────────────────────── */}
      <H2 id="stack-detection">Stack Detection</H2>
      <Prose>
        skillme scans your project directory for known files and infers your tech stack.
        If no files match, it falls back to scanning your README for keyword patterns.
      </Prose>
      <H3>Detected by file</H3>
      <CodeBlock>{`package.json        → node, react, next, vue, angular, svelte,
                      express, fastify, nestjs, prisma, drizzle…
go.mod              → go, gin, echo, fiber, gorm
Cargo.toml          → rust, actix, axum, rocket, tokio
pom.xml             → java, spring, quarkus
build.gradle        → java, kotlin, spring
*.csproj / *.sln    → csharp, aspnet, blazor
Gemfile             → ruby, rails, sinatra
composer.json       → php, laravel, symfony
pubspec.yaml        → dart, flutter
requirements.txt    → python
pyproject.toml      → python, fastapi, django, poetry
Dockerfile          → docker`}
      </CodeBlock>
      <H3>README fallback</H3>
      <Prose>
        If no matching files are found, skillme scans <Code>README.md</Code> for technology
        keywords. README-sourced detections are shown with a dim <Code>(from README)</Code> label.
      </Prose>

      <Divider />

      {/* ── AI MODE ───────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-2">
        <H2 id="ai-mode">AI Mode</H2>
      </div>
      <Callout type="new">
        <Code>skillme init --ai</Code> uses your existing Claude Code subscription — no extra API
        key required.
      </Callout>
      <Prose>
        The <Code>--ai</Code> flag sends your project context to Claude and gets back plugin
        recommendations with specific, project-aware reasons.
      </Prose>
      <CopyCommand command="skillme init --ai" />
      <CodeBlock>{`◇  Analysis complete
│
◆  Select plugins to install:
│  ● commit-commands    "47 commits with inconsistent messages in git log"
│  ● tanstack-query     "found @tanstack/react-query in package.json"
│  ○ security-guidance  ".env file detected alongside SQL queries in src/"
│  ● code-review        "active PR workflow detected in .github/workflows/"
`}
      </CodeBlock>
      <H3>How it works</H3>
      <Prose>
        skillme builds a context snapshot — root files, directory structure, npm dependencies,
        recent git log — and sends it alongside the full plugin list to{' '}
        <Code>claude -p</Code>. Claude returns a ranked list of plugins with one-line reasons
        tied to your specific project. Falls back to file-based detection if the Claude CLI is
        unavailable.
      </Prose>

      <Divider />

      {/* ── TEAM SYNC ─────────────────────────────────────────────── */}
      <H2 id="team-sync">Team Sync</H2>
      <Prose>
        <Code>skillme.json</Code> is a lockfile that captures your project-scope plugin setup.
        Commit it to git so every teammate gets identical Claude Code plugins automatically.
      </Prose>
      <CodeBlock>{`// skillme.json
{
  "version": 1,
  "plugins": [
    { "name": "commit-commands", "marketplace": "claude-plugins-official" },
    { "name": "code-review",     "marketplace": "claude-plugins-official" }
  ]
}`}
      </CodeBlock>
      <Prose>
        New team members run <Code>skillme sync</Code> after cloning. Existing members run
        it after pulling changes that update the lockfile. Only project-scope plugins are
        included — user and local plugins stay personal.
      </Prose>
      <Callout type="tip">
        Add <Code>skillme sync</Code> to your onboarding README or{' '}
        <Code>post-checkout</Code> git hook to make it automatic.
      </Callout>

      <Divider />

      {/* ── SCOPES ────────────────────────────────────────────────── */}
      <H2 id="scopes">Scopes</H2>
      <Prose>
        skillme installs plugins at one of three scopes. The scope controls where the plugin
        entry is written and who it applies to.
      </Prose>
      <div className="mb-5 rounded-xl border border-white/6 px-4">
        <OptionRow
          flag="project"
          desc="Written to .claude/settings.json — shared with your team via git. Use this for project-specific plugins everyone should have."
        />
        <OptionRow
          flag="user"
          desc="Written to ~/.claude/settings.json — applies to you across all projects. Use this for personal workflow plugins."
        />
        <OptionRow
          flag="local"
          desc="Written to .claude/settings.local.json — gitignored, only you, this project. Use this for personal overrides."
        />
      </div>
      <Callout type="note">
        The default scope for <Code>skillme init</Code> and <Code>skillme install</Code> is{' '}
        <Code>project</Code> and <Code>user</Code> respectively. Pass{' '}
        <Code>--scope &lt;scope&gt;</Code> to override.
      </Callout>

    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────────

export default function DocsClient() {
  const [active, setActive] = useState('installation');

  useEffect(() => {
    const allIds = NAV.flatMap(g => g.items.map(i => i.id));

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          // pick the topmost visible section
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActive(topmost.target.id);
        }
      },
      { rootMargin: '-8% 0% -80% 0%', threshold: 0 },
    );

    allIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background orb */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-full rounded-full opacity-8"
        style={{ background: 'radial-gradient(ellipse at center, #10b981 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* ── NAV ─────────────────────────────────────────────────── */}
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
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-all hover:border-emerald-500/50 hover:text-white sm:px-4"
            >
              npm
            </a>
          </div>
        </nav>

        {/* ── LAYOUT ──────────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
          <div className="lg:grid lg:grid-cols-[220px_1fr]">

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-0 h-screen overflow-y-auto border-r border-white/6">
                <Sidebar active={active} />
              </div>
            </aside>

            {/* Content */}
            <main>
              {/* Mobile TOC */}
              <details className="mb-8 mt-6 rounded-xl border border-white/8 bg-white/3 px-4 py-3 lg:hidden">
                <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-zinc-400">
                  Table of contents
                </summary>
                <div className="mt-3 flex flex-col gap-1">
                  {NAV.map(group => (
                    <div key={group.group} className="mb-2">
                      <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                        {group.group}
                      </div>
                      {group.items.map(item => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="block py-1 text-sm text-zinc-400 hover:text-white"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </details>

              <DocsContent />
            </main>
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────── */}
        <footer className="border-t border-white/6 px-4 py-8 sm:px-6 md:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <a href="/" className="font-mono text-sm text-zinc-600 transition-colors hover:text-white">
              ← Back to home
            </a>
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
