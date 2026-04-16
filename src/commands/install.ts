import { intro, outro, select, isCancel, spinner, log } from '@clack/prompts';
import pc from 'picocolors';
import { fetchIndex, findPlugin, searchPlugins } from '../marketplace/index.js';
import { assertClaudeInstalled, installPlugin, type Scope } from '../installer/index.js';
import { logger } from '../utils/logger.js';
import { PluginNotFoundError, SkillmeError } from '../utils/errors.js';

export async function runInstall(name: string, options: { scope?: Scope; marketplace?: string }) {
  intro(pc.bold(pc.cyan('skillme install') + ` — ${name}`));

  try {
    assertClaudeInstalled();

    const s = spinner();
    s.start('Looking up plugin');
    let data;
    try {
      data = await fetchIndex();
    } catch (err) {
      s.stop('Index fetch failed — using bundled data');
      logger.warn(`Live fetch failed: ${String(err)}`);
      data = await fetchIndex();
    }
    s.stop('');

    logger.debug(`Looking up plugin: ${name}`);
    let plugin = findPlugin(data, name);

    if (!plugin) {
      logger.debug(`Exact match not found for "${name}" — trying fuzzy search`);
      const fuzzy = searchPlugins(data, name);

      if (fuzzy.length === 0) {
        throw new PluginNotFoundError(name);
      }

      if (fuzzy.length === 1) {
        plugin = fuzzy[0];
        log.info(`Exact match not found. Using closest: ${pc.bold(plugin.name)}`);
      } else {
        const choice = await select({
          message: `"${name}" not found exactly. Did you mean:`,
          options: fuzzy.slice(0, 5).map(p => ({
            value: p.name,
            label: `${pc.bold(p.name)}  ${pc.dim(p.description)}`,
            hint: p.trusted ? pc.green('official') : pc.yellow('community'),
          })),
        });
        if (isCancel(choice)) { outro('Cancelled.'); return; }
        plugin = findPlugin(data, choice as string)!;
      }
    }

    // validate marketplace option against known marketplaces
    if (options.marketplace) {
      const known = data.marketplaces.map(m => m.id);
      if (!known.includes(options.marketplace)) {
        log.warn(`Unknown marketplace "${options.marketplace}". Known: ${known.join(', ')}`);
        log.info('Proceeding with default source from the index.');
        options.marketplace = undefined;
      }
    }

    const marketplace = options.marketplace ?? plugin.marketplace;
    const scope: Scope = options.scope ?? 'user';

    log.info(`Source: ${pc.bold(marketplace)}  Scope: ${pc.bold(scope)}`);
    if (plugin.requiresBinary) {
      log.warn(`Requires binary: ${pc.cyan(plugin.requiresBinary)}`);
    }

    logger.debug(`Installing ${plugin.name}@${marketplace} --scope ${scope}`);
    process.stdout.write(`\n  ${pc.dim('installing')} ${plugin.name}...`);
    const ok = installPlugin(plugin.name, marketplace, scope);

    if (ok) {
      process.stdout.write(`\r  ${pc.green('✓')} ${plugin.name}\n`);
      outro(pc.green('Done.') + ' Run ' + pc.cyan('/reload-plugins') + ' in Claude Code to activate.');
    } else {
      process.stdout.write(`\r  ${pc.red('✗')} Installation failed\n`);
      log.warn('Check that Claude Code CLI is up to date.');
      log.info('Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
      outro('');
    }

  } catch (err) {
    if (err instanceof SkillmeError) {
      log.error(err.message);
    } else {
      logger.error('Unexpected error in install', err);
      log.error('Something went wrong. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    process.exit(1);
  }
}
