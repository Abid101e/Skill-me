import fs from 'fs';
import path from 'path';
import os from 'os';
import { intro, outro, select, isCancel, log } from '@clack/prompts';
import pc from 'picocolors';
import { logger } from '../utils/logger.js';
import { SkillmeError } from '../utils/errors.js';
import type { Scope } from '../installer/index.js';

interface ClaudeSettings {
  enabledPlugins?: Record<string, boolean>;
  [key: string]: unknown;
}

function settingsPath(scope: Scope): string {
  if (scope === 'user')  return path.join(os.homedir(), '.claude', 'settings.json');
  if (scope === 'local') return path.join(process.cwd(), '.claude', 'settings.local.json');
  return path.join(process.cwd(), '.claude', 'settings.json');
}

function readPlugins(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ClaudeSettings;
    return Object.keys(raw.enabledPlugins ?? {});
  } catch {
    return [];
  }
}

function removePlugin(filePath: string, pluginKey: string): boolean {
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ClaudeSettings;
    if (!raw.enabledPlugins || !(pluginKey in raw.enabledPlugins)) return false;
    delete raw.enabledPlugins[pluginKey];
    fs.writeFileSync(filePath, JSON.stringify(raw, null, 2) + '\n');
    return true;
  } catch (err) {
    logger.debug(`removePlugin failed: ${String(err)}`);
    return false;
  }
}

export async function runUninstall(name?: string) {
  intro(pc.bold(pc.cyan('skillme uninstall') + ' — remove a plugin'));

  try {
    const scopes: Scope[] = ['user', 'project', 'local'];

    // build list of all installed plugins with their scope
    const installed: Array<{ key: string; scope: Scope }> = [];
    for (const scope of scopes) {
      for (const key of readPlugins(settingsPath(scope))) {
        installed.push({ key, scope });
      }
    }

    if (installed.length === 0) {
      log.warn('No plugins installed across any scope.');
      outro('');
      return;
    }

    let target: { key: string; scope: Scope };

    if (name) {
      // match by full key or bare name (before the @)
      const match = installed.find(
        i => i.key === name || i.key.split('@')[0] === name
      );
      if (!match) {
        log.error(`"${name}" is not installed in any scope.`);
        log.info('Run ' + pc.cyan('skillme list') + ' to see what is installed.');
        process.exit(1);
      }
      target = match;
    } else {
      const choice = await select({
        message: 'Select a plugin to uninstall:',
        options: installed.map(i => {
          const atIndex = i.key.lastIndexOf('@');
          const displayName = atIndex > 0 ? i.key.slice(0, atIndex) : i.key;
          const marketplace = atIndex > 0 ? i.key.slice(atIndex) : '';
          return {
            value: `${i.key}::${i.scope}`,
            label: `${pc.bold(displayName)}  ${pc.dim(marketplace)}`,
            hint: `${i.scope} scope`,
          };
        }),
      });

      if (isCancel(choice)) {
        outro('Cancelled.');
        return;
      }

      const [key, scope] = (choice as string).split('::');
      target = { key, scope: scope as Scope };
    }

    const filePath = settingsPath(target.scope);
    logger.debug(`Removing "${target.key}" from ${target.scope} scope (${filePath})`);

    const ok = removePlugin(filePath, target.key);

    if (ok) {
      log.info(`${pc.bold(target.key)} removed from ${pc.bold(target.scope)} scope.`);
      outro('Run ' + pc.cyan('/reload-plugins') + ' in Claude Code to apply changes.');
    } else {
      log.error(`Could not remove "${target.key}" — settings file may be read-only or corrupt.`);
      log.info('Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
      process.exit(1);
    }

  } catch (err) {
    if (err instanceof SkillmeError) {
      log.error(err.message);
    } else {
      logger.error('Unexpected error in uninstall', err);
      log.error('Something went wrong. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    process.exit(1);
  }
}
