import { Command } from 'commander';
import { version } from '../package.json';
import { runInit } from './commands/init.js';
import { runSearch } from './commands/search.js';
import { runInstall } from './commands/install.js';
import { runList } from './commands/list.js';
import { runUpdate } from './commands/update.js';
import { runUninstall } from './commands/uninstall.js';
import { validateScope, validatePluginName, validateMarketplaceId, type Scope } from './installer/index.js';
import { SkillmeError } from './utils/errors.js';
import { logger } from './utils/logger.js';
import pc from 'picocolors';

// ─── Global error handlers ────────────────────────────────────────────────────

process.on('uncaughtException', (err: Error) => {
  if (err instanceof SkillmeError) {
    console.error(`\n${pc.red('✗')} ${err.message}`);
  } else {
    logger.error('Unexpected error', err);
    console.error(pc.dim('Run with DEBUG=skillme for more details.'));
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  if (reason instanceof SkillmeError) {
    console.error(`\n${pc.red('✗')} ${reason.message}`);
  } else if (reason instanceof Error) {
    logger.error('Unhandled rejection', reason);
    console.error(pc.dim('Run with DEBUG=skillme for more details.'));
  } else {
    logger.error(`Unhandled rejection: ${String(reason)}`);
  }
  process.exit(1);
});

// ─── Input guards ──────────────────────────────────────────────────────────────

function guardScope(scope: string): Scope {
  if (!validateScope(scope)) {
    console.error(`${pc.red('✗')} Invalid scope "${scope}". Must be: user | project | local`);
    process.exit(1);
  }
  return scope as Scope;
}

function guardQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    console.error(`${pc.red('✗')} Search query cannot be empty.`);
    process.exit(1);
  }
  if (trimmed.length > 100) {
    console.error(`${pc.red('✗')} Search query too long (max 100 characters).`);
    process.exit(1);
  }
  return trimmed;
}

function guardPluginName(name: string): string {
  if (!validatePluginName(name)) {
    console.error(`${pc.red('✗')} Invalid plugin name "${name}".`);
    process.exit(1);
  }
  return name;
}

function guardMarketplace(id?: string): string | undefined {
  if (id === undefined) return undefined;
  if (!validateMarketplaceId(id)) {
    console.error(`${pc.red('✗')} Invalid marketplace id "${id}".`);
    process.exit(1);
  }
  return id;
}

// ─── Commands ─────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('skillme')
  .description('The missing package manager for Claude Code plugins')
  .version(version);

program
  .command('init')
  .description('Detect your stack and install recommended Claude Code plugins')
  .option('-s, --scope <scope>', 'install scope: user | project | local', 'project')
  .action(async (options: { scope: string }) => {
    await runInit({ scope: guardScope(options.scope) });
  });

program
  .command('search <query>')
  .description('Search for plugins across all marketplaces')
  .option('-s, --scope <scope>', 'install scope: user | project | local', 'user')
  .action(async (query: string, options: { scope: string }) => {
    await runSearch(guardQuery(query), { scope: guardScope(options.scope) });
  });

program
  .command('install <name>')
  .description('Install a plugin by name')
  .option('-s, --scope <scope>', 'install scope: user | project | local', 'user')
  .option('-m, --marketplace <id>', 'specify marketplace to install from')
  .action(async (name: string, options: { scope: string; marketplace?: string }) => {
    await runInstall(guardPluginName(name), {
      scope: guardScope(options.scope),
      marketplace: guardMarketplace(options.marketplace),
    });
  });

program
  .command('list')
  .description('Show all installed plugins')
  .action(() => {
    runList();
  });

program
  .command('update')
  .description('Refresh the marketplace index from GitHub')
  .action(async () => {
    await runUpdate();
  });

program
  .command('uninstall [name]')
  .description('Remove an installed plugin (interactive if no name given)')
  .action(async (name?: string) => {
    if (name) guardPluginName(name);
    await runUninstall(name);
  });

program.parse();
