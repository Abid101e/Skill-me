# skillme

> The missing package manager for Claude Code plugins.

`skillme` detects your project stack and installs the right Claude Code plugins in one command — no manual searching, no browsing marketplaces, no editing config files.

---

## The Problem

Finding and installing Claude Code plugins today means:

1. Manually browsing the official marketplace
2. Searching GitHub for community marketplaces (if you even know they exist)
3. Running multiple commands to add each marketplace and install each plugin
4. Doing this again for every project, every teammate

There is no way to say: *"I just cloned a Next.js + Prisma project — what should I install?"*

---

## The Solution

```bash
npx skillme init
```

```
Detecting your project stack...

Found:
  → Next.js 14
  → TypeScript (strict)
  → Prisma + PostgreSQL
  → GitHub Actions

Recommended plugins for your stack:

  ◉  typescript-lsp       [official]  Type errors & go-to-def in real time
  ◉  commit-commands      [official]  Git commit / push / PR workflow
  ◉  pr-review-toolkit    [official]  PR review agent
  ◉  github               [official]  GitHub integration
  ◉  code-review          [official]  Automated code review skill
  ○  explanatory-output   [official]  More detailed Claude responses

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
Detects your stack and recommends plugins. Interactive checklist to select and install.

```bash
npx skillme init
```

### `skillme search <query>`
Searches across all known marketplaces for plugins matching your query.

```bash
npx skillme search "git workflow"
npx skillme search "python lsp"
```

### `skillme install <name>`
Installs a specific plugin. Finds the best source automatically.

```bash
npx skillme install commit-commands
npx skillme install github
```

### `skillme list`
Shows all installed plugins grouped by scope.

```bash
npx skillme list
```

### `skillme update`
Refreshes the marketplace index and checks for plugin updates.

```bash
npx skillme update
```

---

## Install Scopes

Every command supports `--scope` to control who gets the plugin:

| Scope | Where it applies | Use case |
|---|---|---|
| `project` | `.claude/settings.json` | Shared with your whole team via git |
| `user` | `~/.claude/settings.json` | Just you, across all projects (default) |
| `local` | `.claude/settings.local.json` | Just you, this project, gitignored |

```bash
npx skillme init --scope project    # recommended for teams
npx skillme init --scope user       # personal setup
```

---

## Supported Stacks

| Stack | Detected from | Recommended plugins |
|---|---|---|
| Next.js | `package.json` | typescript-lsp, commit-commands, pr-review-toolkit, github |
| React | `package.json` | typescript-lsp, commit-commands, frontend-design |
| TypeScript | `package.json` / `tsconfig.json` | typescript-lsp |
| Python | `requirements.txt` / `pyproject.toml` | pyright-lsp, commit-commands, code-review |
| FastAPI | `requirements.txt` | pyright-lsp, commit-commands, code-review |
| Go | `go.mod` | gopls-lsp, commit-commands |
| Rust | `Cargo.toml` | rust-analyzer-lsp, commit-commands |
| Prisma | `package.json` | code-review |
| GitHub CI | `.github/workflows/` | github, commit-commands |
| Docker | `Dockerfile` | security-guidance |

More stacks added continuously. See [PLAN.md](./PLAN.md) for the roadmap.

---

## How It Works

1. **Detects your stack** by reading config files (`package.json`, `go.mod`, `Cargo.toml`, etc.)
2. **Fetches recommendations** from a curated index of known marketplaces
3. **Ranks plugins** by trust (Anthropic official first), then GitHub stars and freshness
4. **Installs via Claude Code CLI** — wraps `claude plugin install` under the hood, no new systems

The marketplace index (`data/index.json`) lives in this repo and is fetched fresh on each run. Anyone can submit a PR to add a community marketplace.

---

## Requirements

- [Claude Code](https://claude.ai/code) installed (`claude` in your PATH)
- Node.js 18+

---

## Contributing

### Adding a marketplace to the index

Edit `data/index.json` and open a PR:

```json
{
  "id": "your-marketplace-id",
  "repo": "your-github-username/your-repo",
  "trusted": false,
  "description": "What this marketplace focuses on"
}
```

### Adding stack recommendations

Edit the `recommendations` section in `data/index.json`:

```json
"your-framework": ["plugin-one", "plugin-two"]
```

### Building locally

```bash
git clone https://github.com/your-username/skillme
cd skillme
npm install
npm run dev
```

---

## Why Not Just Use `/plugin discover`?

The built-in `/plugin` Discover tab only shows the official Anthropic marketplace. It has no:
- Cross-marketplace search
- Stack-based recommendations
- Quality ranking across sources
- One-command team setup

`skillme` is the layer on top that makes discovery and install actually fast.

---

## License

MIT
