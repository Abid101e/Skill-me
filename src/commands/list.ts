import fs from 'fs';
import path from 'path';
import os from 'os';
import { intro, outro, log } from '@clack/prompts';
import pc from 'picocolors';
import { logger } from '../utils/logger.js';
import { SkillmeError } from '../utils/errors.js';

interface ClaudeSettings {
  enabledPlugins?: Record<string, boolean>;
}

function readSettings(filePath: string, scopeLabel: string): string[] {
  try {
    if (!fs.existsSync(filePath)) {
      logger.debug(`No settings file at ${filePath}`);
      return [];
    }

    const raw: unknown = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (typeof raw !== 'object' || raw === null) {
      logger.warn(`Settings file is not a valid object: ${filePath}`);
      return [];
    }

    const data = raw as ClaudeSettings;

    if (!data.enabledPlugins || typeof data.enabledPlugins !== 'object') {
      logger.debug(`No enabledPlugins in ${scopeLabel} settings`);
      return [];
    }

    const plugins = Object.keys(data.enabledPlugins);
    logger.debug(`${scopeLabel} scope: ${plugins.length} plugin(s)`);
    return plugins;

  } catch (err) {
    if (err instanceof SyntaxError) {
      logger.warn(`Settings file has invalid JSON (${filePath}): ${err.message}`);
    } else {
      logger.warn(`Could not read settings file (${filePath}): ${String(err)}`);
    }
    return [];
  }
}

function printScope(label: string, plugins: string[]) {
  if (plugins.length === 0) return;
  console.log(`\n  ${pc.bold(pc.dim(label + ' scope'))}`);
  for (const p of plugins) {
    const atIndex = p.lastIndexOf('@');
    const name = atIndex > 0 ? p.slice(0, atIndex) : p;
    const marketplace = atIndex > 0 ? p.slice(atIndex) : '';
    console.log(`  ${pc.green('✓')} ${pc.bold(name)}  ${pc.dim(marketplace)}`);
  }
}

export function runList() {
  intro(pc.bold(pc.cyan('skillme list') + ' — installed plugins'));

  try {
    const userPlugins    = readSettings(path.join(os.homedir(), '.claude', 'settings.json'), 'user');
    const projectPlugins = readSettings(path.join(process.cwd(), '.claude', 'settings.json'), 'project');
    const localPlugins   = readSettings(path.join(process.cwd(), '.claude', 'settings.local.json'), 'local');

    const total = userPlugins.length + projectPlugins.length + localPlugins.length;

    if (total === 0) {
      log.warn('No plugins installed. Run ' + pc.cyan('skillme init') + ' to get started.');
      outro('');
      return;
    }

    printScope('user',    userPlugins);
    printScope('project', projectPlugins);
    printScope('local',   localPlugins);

    console.log('');
    outro(`${total} plugin(s) installed across all scopes.`);

  } catch (err) {
    if (err instanceof SkillmeError) {
      log.error(err.message);
    } else {
      logger.error('Unexpected error in list', err);
      log.error('Could not read plugin list. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    process.exit(1);
  }
}
