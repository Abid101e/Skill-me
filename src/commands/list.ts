import fs from 'fs';
import path from 'path';
import os from 'os';
import { intro, outro, spinner } from '@clack/prompts';
import pc from 'picocolors';
import { fetchIndex } from '../marketplace/index.js';
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

function stripMarketplace(raw: string): string {
  const at = raw.lastIndexOf('@');
  return at > 0 ? raw.slice(0, at) : raw;
}

function printScope(
  label: string,
  plugins: string[],
  descriptions: Record<string, string>
) {
  if (plugins.length === 0) return;
  console.log(`\n  ${pc.bold(pc.dim(label + ' scope'))}`);
  for (const p of plugins) {
    const name = stripMarketplace(p);
    const desc = descriptions[name];
    const descLine = desc
      ? pc.dim('  ' + desc.split('\n')[0].replace(/[#*`>_~]/g, '').trim().slice(0, 72))
      : '';
    console.log(`  ${pc.green('✓')} ${pc.bold(name)}`);
    if (descLine) console.log(`    ${descLine}`);
  }
}

export async function runList() {
  intro(pc.bold(pc.cyan('skillme list') + ' — installed plugins'));

  try {
    const userPlugins    = readSettings(path.join(os.homedir(), '.claude', 'settings.json'), 'user');
    const projectPlugins = readSettings(path.join(process.cwd(), '.claude', 'settings.json'), 'project');
    const localPlugins   = readSettings(path.join(process.cwd(), '.claude', 'settings.local.json'), 'local');

    const total = userPlugins.length + projectPlugins.length + localPlugins.length;

    if (total === 0) {
      console.log('');
      console.log(`  ${pc.yellow('!')} No plugins installed. Run ${pc.cyan('skillme init')} to get started.`);
      console.log('');
      outro('');
      return;
    }

    // Fetch descriptions silently — fall back to empty if offline
    const descriptions: Record<string, string> = {};
    try {
      const s = spinner();
      s.start('Loading descriptions');
      const data = await fetchIndex();
      for (const [name, plugin] of Object.entries(data.plugins)) {
        descriptions[name] = plugin.description;
      }
      s.stop('');
    } catch {
      // not critical — list still works without descriptions
    }

    printScope('user',    userPlugins,    descriptions);
    printScope('project', projectPlugins, descriptions);
    printScope('local',   localPlugins,   descriptions);

    console.log('');
    outro(`${total} plugin(s) installed across all scopes.`);

  } catch (err) {
    if (err instanceof SkillmeError) {
      console.error(`\n${pc.red('✗')} ${err.message}`);
    } else {
      logger.error('Unexpected error in list', err);
      console.error(pc.dim('Run with DEBUG=skillme for more details.'));
    }
    process.exit(1);
  }
}
