import { Command } from 'commander';
import { runInit } from './commands/init.js';
import type { Scope } from './installer/index.js';

const program = new Command();

program
  .name('skillme')
  .description('The missing package manager for Claude Code plugins')
  .version('0.1.0');

program
  .command('init')
  .description('Detect your stack and install recommended Claude Code plugins')
  .option('-s, --scope <scope>', 'install scope: user | project | local', 'project')
  .action(async (options: { scope: Scope }) => {
    await runInit(options);
  });

program.parse();
