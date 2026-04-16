import { intro, outro, spinner, log, confirm, isCancel } from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import { fetchIndex } from '../marketplace/index.js';
import { installPlugin, assertClaudeInstalled, type Scope } from '../installer/index.js';
import { logger } from '../utils/logger.js';
import { SkillmeError } from '../utils/errors.js';

interface InstalledPlugin {
  name: string;
  scope: Scope;
  marketplace: string;
}

function readScope(filePath: string, scope: Scope): InstalledPlugin[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
    const ep = raw['enabledPlugins'];
    if (typeof ep !== 'object' || ep === null) return [];
    return Object.keys(ep as Record<string, unknown>).map(entry => {
      const at = entry.lastIndexOf('@');
      const name = at > 0 ? entry.slice(0, at) : entry;
      const marketplace = at > 0 ? entry.slice(at + 1) : '';
      return { name, scope, marketplace };
    });
  } catch {
    return [];
  }
}

export async function runUpgrade() {
  intro(pc.bold(pc.cyan('skillme upgrade') + ' — update all installed plugins'));

  try {
    assertClaudeInstalled();

    // Gather all installed plugins across scopes
    const installed: InstalledPlugin[] = [
      ...readScope(path.join(os.homedir(), '.claude', 'settings.json'), 'user'),
      ...readScope(path.join(process.cwd(), '.claude', 'settings.json'), 'project'),
      ...readScope(path.join(process.cwd(), '.claude', 'settings.local.json'), 'local'),
    ];

    if (installed.length === 0) {
      log.warn('No plugins installed. Run ' + pc.cyan('skillme init') + ' to get started.');
      outro('');
      return;
    }

    // Fetch index to fill in marketplace for entries that don't have it
    const s = spinner();
    s.start('Loading plugin index');
    let marketplaceMap: Record<string, string> = {};
    try {
      const data = await fetchIndex();
      for (const [name, plugin] of Object.entries(data.plugins)) {
        marketplaceMap[name] = plugin.marketplace;
      }
    } catch (err) {
      logger.warn(`Could not fetch live index: ${String(err)}`);
    }
    s.stop('');

    // Resolve marketplace for each plugin
    const toUpgrade = installed.map(p => ({
      ...p,
      marketplace: p.marketplace || marketplaceMap[p.name] || 'claude-plugins-official',
    }));

    log.info(
      `Found ${toUpgrade.length} plugin(s):\n` +
      toUpgrade.map(p =>
        `  ${pc.dim('·')} ${pc.bold(p.name)} ${pc.dim(`(${p.scope})`)}`
      ).join('\n')
    );
    console.log('');

    // Skip interactive confirm in non-TTY environments
    if (process.stdout.isTTY) {
      const go = await confirm({ message: 'Re-install all to get latest versions?' });
      if (isCancel(go) || !go) {
        outro('Upgrade cancelled.');
        return;
      }
    }

    console.log('');
    let upgraded = 0;
    let failed = 0;

    for (const plugin of toUpgrade) {
      process.stdout.write(`  ${pc.dim('upgrading')} ${plugin.name}...`);
      try {
        const ok = installPlugin(plugin.name, plugin.marketplace, plugin.scope);
        if (ok) {
          process.stdout.write(`\r  ${pc.green('✓')} ${plugin.name}\n`);
          upgraded++;
        } else {
          process.stdout.write(`\r  ${pc.red('✗')} ${plugin.name}\n`);
          failed++;
        }
      } catch (err) {
        process.stdout.write(`\r  ${pc.red('✗')} ${plugin.name}\n`);
        logger.warn(`Upgrade failed for ${plugin.name}: ${String(err)}`);
        failed++;
      }
    }

    console.log('');

    if (failed > 0) {
      log.warn(`${failed} plugin(s) failed. Run with ${pc.cyan('DEBUG=skillme')} for details.`);
    }

    outro(
      upgraded > 0
        ? pc.green(`${upgraded} plugin(s) upgraded.`) + ' Run ' + pc.cyan('/reload-plugins') + ' in Claude Code to activate.'
        : 'Nothing was upgraded.'
    );

  } catch (err) {
    if (err instanceof SkillmeError) {
      log.error(err.message);
    } else {
      logger.error('Unexpected error in upgrade', err);
      log.error('Something went wrong. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    process.exit(1);
  }
}
