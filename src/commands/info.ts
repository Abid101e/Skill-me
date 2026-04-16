import { intro, outro, spinner, log } from '@clack/prompts';
import pc from 'picocolors';
import { fetchIndex, findPlugin } from '../marketplace/index.js';
import { logger } from '../utils/logger.js';
import { SkillmeError } from '../utils/errors.js';

export async function runInfo(name: string) {
  intro(pc.bold(pc.cyan('skillme info') + ` — ${name}`));

  try {
    const s = spinner();
    s.start('Loading index');

    let data;
    try {
      data = await fetchIndex();
    } catch (err) {
      s.stop('Index fetch failed — using bundled data');
      logger.warn(`Live fetch failed: ${String(err)}`);
      data = await fetchIndex();
    }

    const plugin = findPlugin(data, name);
    s.stop('');

    if (!plugin) {
      log.warn(`Plugin "${name}" not found.`);
      log.info('Run ' + pc.cyan(`skillme search ${name}`) + ' to find similar plugins.');
      outro('');
      return;
    }

    // Find which stacks recommend this plugin
    const stacks = Object.entries(data.recommendations)
      .filter(([, plugins]) => plugins.includes(plugin.name))
      .map(([stack]) => stack);

    // ── Output ────────────────────────────────────────────────────────────────

    console.log('');
    console.log(
      `  ${pc.bold(pc.white(plugin.name))}  ` +
      (plugin.trusted ? pc.green('[official]') : pc.yellow('[community]'))
    );
    console.log('');

    // Description
    const desc = plugin.description
      .split('\n')[0]
      .replace(/[#*`>_~]/g, '')
      .replace(/Examples?:.*/i, '')
      .replace(/Context:.*/i, '')
      .trim()
      .slice(0, 200);

    console.log(`  ${pc.dim('Description')}`);
    console.log(`    ${desc}`);
    console.log('');

    // Tags
    if (plugin.tags.length > 0) {
      console.log(`  ${pc.dim('Tags')}`);
      console.log(`    ${plugin.tags.map(t => pc.cyan(t)).join(pc.dim(' · '))}`);
      console.log('');
    }

    // Marketplace
    console.log(`  ${pc.dim('Marketplace')}    ${plugin.marketplace}`);

    // Binary requirement
    if (plugin.requiresBinary) {
      console.log(`  ${pc.dim('Requires')}       ${pc.yellow(plugin.requiresBinary)}`);
    }

    // Stacks
    if (stacks.length > 0) {
      console.log(`  ${pc.dim('Recommended for')}  ${stacks.map(s => pc.dim(s)).join(pc.dim(' · '))}`);
    }

    console.log('');
    console.log(`  ${pc.dim('Install')}`);
    console.log(`    ${pc.cyan(`skillme install ${plugin.name}`)}`);
    console.log('');

    outro('');

  } catch (err) {
    if (err instanceof SkillmeError) {
      log.error(err.message);
    } else {
      logger.error('Unexpected error in info', err);
      log.error('Something went wrong. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    process.exit(1);
  }
}
