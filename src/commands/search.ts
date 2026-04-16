import { intro, outro, select, isCancel, spinner, log } from '@clack/prompts';
import pc from 'picocolors';
import { fetchIndex, searchPlugins } from '../marketplace/index.js';
import { assertClaudeInstalled, installPlugin, type Scope } from '../installer/index.js';
import { logger } from '../utils/logger.js';
import { SkillmeError } from '../utils/errors.js';

export async function runSearch(query: string, options: { scope?: Scope }) {
  intro(pc.bold(pc.cyan('skillme search') + ` — "${query}"`));

  try {
    const s = spinner();
    s.start('Searching across all marketplaces');

    let data;
    try {
      data = await fetchIndex();
    } catch (err) {
      s.stop('Index fetch failed — using bundled data');
      logger.warn(`Live fetch failed: ${String(err)}`);
      const { fetchIndex: fi } = await import('../marketplace/index.js');
      data = await fi();
    }

    const results = searchPlugins(data, query);
    s.stop(`Found ${results.length} result(s)`);
    logger.debug(`Search "${query}" → ${results.length} results`);

    if (results.length === 0) {
      log.warn(`No plugins found for "${query}".`);
      log.info('Try a broader keyword or run ' + pc.cyan('skillme update') + ' to refresh the index.');
      outro('');
      return;
    }

    if (!process.stdout.isTTY) {
      log.info('Results (run ' + pc.cyan('skillme install <name>') + ' to install):');
      for (const p of results.slice(0, 10)) {
        const desc = p.description.split('\n')[0].replace(/[#*`>_~]/g, '').trim().slice(0, 80);
        console.log(
          `  ${pc.bold(p.name)}  ` +
          (p.trusted ? pc.green('[official]') : pc.yellow('[community]')) +
          `\n    ${pc.dim(desc)}`
        );
      }
      outro('');
      return;
    }

    const choice = await select({
      message: 'Select a plugin to install (or press Esc to exit):',
      options: results.map((p, i) => {
        const desc = p.description.split('\n')[0].replace(/[#*`>_~]/g, '').trim().slice(0, 72);
        return {
          value: p.name,
          label:
            `${pc.bold(p.name)}  ` +
            (p.trusted ? pc.green('[official]') : pc.yellow('[community]')) +
            `\n    ${pc.dim(desc)}` +
            (p.requiresBinary ? pc.dim(`\n    requires: ${p.requiresBinary}`) : ''),
          hint: String(i + 1),
        };
      }),
    });

    if (isCancel(choice)) {
      outro('Nothing installed.');
      return;
    }

    assertClaudeInstalled();

    const scope: Scope = options.scope ?? 'user';
    const plugin = results.find(p => p.name === choice)!;

    logger.debug(`Installing ${plugin.name}@${plugin.marketplace} --scope ${scope}`);
    process.stdout.write(`\n  ${pc.dim('installing')} ${plugin.name}...`);
    const ok = installPlugin(plugin.name, plugin.marketplace, scope);

    if (ok) {
      process.stdout.write(`\r  ${pc.green('✓')} ${plugin.name} installed (${scope})\n`);
      if (plugin.requiresBinary) {
        log.warn(`This plugin requires a binary: ${pc.cyan(plugin.requiresBinary)}`);
      }
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
      logger.error('Unexpected error in search', err);
      log.error('Something went wrong. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    process.exit(1);
  }
}
