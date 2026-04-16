# skillme

> The missing plugin manager for Claude Code.

[![npm](https://img.shields.io/npm/v/skillme?color=10b981&label=npm)](https://www.npmjs.com/package/skillme)
[![license](https://img.shields.io/github/license/Abid101e/Skill-me?color=10b981)](LICENSE)

`skillme` detects your project stack and installs the right Claude Code plugins in one command — no manual searching, no browsing marketplaces, no editing config files by hand.

**[Browse plugins & stacks → skillme-cli.vercel.app](https://skillme-cli.vercel.app)**

---

## Install

```bash
npm install -g skillme
```

Or run without installing:

```bash
npx skillme init
```

---

## Quick start

```bash
skillme init
```

```
Detecting your project stack...

Found:
  → Next.js
  → TypeScript
  → Prisma
  → GitHub Actions

Recommended plugins for your stack:

  ◉  typescript-lsp       [official]  Type errors & go-to-def in real time
  ◉  commit-commands      [official]  Git commit / push / PR workflow
  ◉  pr-review-toolkit    [official]  PR review agent
  ◉  github               [official]  GitHub integration
  ◉  code-review          [official]  Automated code review skill

Space to toggle · Enter to install

Installing 5 plugins...
  ✓ typescript-lsp
  ✓ commit-commands
  ✓ pr-review-toolkit
  ✓ github
  ✓ code-review

Done. Run /reload-plugins inside Claude Code to activate.
```

---

## Commands

### `skillme init`
Detects your stack and recommends plugins. Interactive checklist — select what you want, install in one shot.

```bash
skillme init
skillme init --scope project   # share with your team via git
```

### `skillme search <query>`
Searches across all known marketplaces. Select a result to install immediately.

```bash
skillme search "git workflow"
skillme search "python lsp"
```

### `skillme install <name>`
Installs a specific plugin by name.

```bash
skillme install commit-commands
skillme install github --scope project
```

### `skillme info <name>`
Shows details for a plugin — description, tags, marketplace, required binaries, and recommended stacks.

```bash
skillme info commit-commands
skillme info typescript-lsp
```

### `skillme list`
Shows all installed plugins grouped by scope, with descriptions.

```bash
skillme list
```

### `skillme upgrade`
Re-installs all installed plugins to pick up the latest versions.

```bash
skillme upgrade
```

### `skillme update`
Refreshes the marketplace index from GitHub.

```bash
skillme update
```

### `skillme doctor`
Checks your environment for problems — Claude CLI, Node version, plugin binary requirements, and settings file integrity.

```bash
skillme doctor
```

### `skillme uninstall [name]`
Removes an installed plugin. Interactive picker if no name is given.

```bash
skillme uninstall commit-commands
skillme uninstall   # interactive
```

---

## Install scopes

Every install command accepts `--scope` to control where the plugin is saved:

| Scope | File | Use case |
|---|---|---|
| `user` | `~/.claude/settings.json` | Just you, all projects (default) |
| `project` | `.claude/settings.json` | Shared with your team via git |
| `local` | `.claude/settings.local.json` | Just you, this project, gitignored |

```bash
skillme init --scope project   # recommended for teams
```

---

## Supported stacks

30+ stacks detected automatically from your project files:

| Category | Stacks |
|---|---|
| Frontend | Next.js, React, Vue, Nuxt, Svelte |
| Backend | Node.js, Express, Fastify, NestJS, FastAPI, Django, Flask, Spring, Laravel, Rails, Gin, Echo, Fiber, Actix, Axum |
| Language | TypeScript, Python, Go, Rust, Java, C#, Ruby, PHP, Dart/Flutter, Kotlin, Swift |
| Database | Prisma |
| DevOps | GitHub Actions, Docker |

Detection reads `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, `pubspec.yaml`, `.csproj`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `Dockerfile`, `.github/workflows/`, and `README.md` (as a fallback).

---

## How it works

1. **Detects your stack** by reading config files in your project root
2. **Fetches recommendations** from a curated index built from 4 marketplaces (167+ plugins)
3. **Ranks plugins** — Anthropic official first, then community
4. **Installs via Claude Code CLI** — wraps `claude plugin install` under the hood

The index (`data/index.json`) lives in this repo and refreshes nightly via GitHub Actions. No external service required.

---

## Requirements

- [Claude Code](https://claude.ai/code) installed (`claude` in your PATH)
- Node.js 18+

---

## Contributing

### Add a marketplace

Edit the `marketplaces` array in `data/index.json` and open a PR:

```json
{
  "id": "your-marketplace-id",
  "repo": "your-github-username/your-repo",
  "trusted": false,
  "description": "What this marketplace focuses on"
}
```

The marketplace must follow the `plugins/<name>/.claude-plugin/plugin.json` structure used by the official Anthropic marketplace.

### Add stack recommendations

Edit the `recommendations` section in `data/index.json`:

```json
"your-framework": ["plugin-one", "plugin-two"]
```

### Build locally

```bash
git clone https://github.com/Abid101e/Skill-me
cd Skill-me
npm install
npm run build       # compiles src/ → dist/ with tsup
npm run dev         # run CLI directly with tsx (no build step)
```

---

## Why not `/plugin discover`?

The built-in Claude Code plugin tab only shows the official Anthropic marketplace. It has no cross-marketplace search, no stack-based recommendations, and no one-command team setup.

`skillme` is the layer on top that makes discovery and install fast.

---

## License

MIT — [Md. Abid Hasan](https://github.com/Abid101e)
