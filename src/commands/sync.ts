import fs from 'fs';
import path from 'path';
import { intro, outro, log } from '@clack/prompts';
import pc from 'picocolors';
import { installPlugin, addMarketplace } from '../installer/index.js';
import { logger } from '../utils/logger.js';
import { SkillmeError } from '../utils/errors.js';

const LOCKFILE = 'skillme.json';

interface LockfileEntry {
  name: string;
  marketplace: string;
}

interface Lockfile {
  version: number;
  plugins: LockfileEntry[];
}

function parseSetting(raw: string): LockfileEntry {
  const at = raw.lastIndexOf('@');
  if (at > 0) {
    return { name: raw.slice(0, at), marketplace: raw.slice(at + 1) };
  }
  return { name: raw, marketplace: 'claude-plugins-official' };
}

function readProjectPlugins(): LockfileEntry[] {
  const settingsPath = path.join(process.cwd(), '.claude', 'settings.json');
  try {
    if (!fs.existsSync(settingsPath)) return [];
    const raw: unknown = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    if (typeof raw !== 'object' || raw === null) return [];
    const settings = raw as { enabledPlugins?: Record<string, unknown> };
    if (!settings.enabledPlugins) return [];
    return Object.keys(settings.enabledPlugins).map(parseSetting);
  } catch {
    return [];
  }
}

function readLockfile(lockPath: string): Lockfile | null {
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    if (
      typeof raw === 'object' && raw !== null &&
      'version' in raw && 'plugins' in raw &&
      Array.isArray((raw as Lockfile).plugins)
    ) {
      return raw as Lockfile;
    }
    return null;
  } catch {
    return null;
  }
}

function writeLockfile(lockPath: string, plugins: LockfileEntry[]): void {
  const lockfile: Lockfile = { version: 1, plugins };
  fs.writeFileSync(lockPath, JSON.stringify(lockfile, null, 2) + '\n', 'utf-8');
}

export async function runSync(options: { save?: boolean }) {
  intro(pc.bold(pc.cyan('skillme sync') + ' — team plugin sync'));

  try {
    const lockPath = path.join(process.cwd(), LOCKFILE);
    const lockExists = fs.existsSync(lockPath);

    // ── SAVE MODE ─────────────────────────────────────────────────────────────
    if (options.save || !lockExists) {
      const plugins = readProjectPlugins();

      if (plugins.length === 0) {
        log.warn('No project-scope plugins installed.');
        log.info(
          `Run ${pc.cyan('skillme init')} or ` +
          `${pc.cyan('skillme install <name> --scope project')} first, then re-run sync.`
        );
        outro('');
        return;
      }

      writeLockfile(lockPath, plugins);
      console.log('');
      console.log(
        `  ${pc.green('✓')} ${pc.bold(LOCKFILE)} ${options.save ? 'updated' : 'created'} ` +
        `with ${plugins.length} plugin(s):`
      );
      for (const p of plugins) {
        console.log(`    ${pc.dim('→')} ${p.name}`);
      }
      console.log('');
      outro(
        `Commit ${pc.cyan(LOCKFILE)} to share this setup with your team.\n` +
        `  They run ${pc.cyan('skillme sync')} to get the exact same plugins.`
      );
      return;
    }

    // ── SYNC MODE ─────────────────────────────────────────────────────────────
    const lockfile = readLockfile(lockPath);
    if (!lockfile) {
      log.error(`${LOCKFILE} is invalid or unreadable.`);
      log.info(`Run ${pc.cyan('skillme sync --save')} to regenerate it.`);
      process.exit(1);
    }

    if (lockfile.plugins.length === 0) {
      log.warn(`${LOCKFILE} has no plugins defined.`);
      outro('Nothing to install.');
      return;
    }

    const installed = new Set(readProjectPlugins().map(p => p.name));
    const toInstall = lockfile.plugins.filter(p => !installed.has(p.name));
    const alreadyHave = lockfile.plugins.filter(p => installed.has(p.name));

    console.log('');
    for (const p of alreadyHave) {
      console.log(`  ${pc.green('✓')} ${p.name} ${pc.dim('already installed')}`);
    }

    if (toInstall.length === 0) {
      if (alreadyHave.length > 0) console.log('');
      outro('All plugins from lockfile are already installed.');
      return;
    }

    log.info(`Installing ${toInstall.length} plugin(s) from ${pc.cyan(LOCKFILE)}...`);
    console.log('');

    const marketplaces = new Set(toInstall.map(p => p.marketplace));
    for (const mp of marketplaces) addMarketplace(mp);

    const succeeded: string[] = [];
    const failed: string[] = [];

    for (const p of toInstall) {
      process.stdout.write(`  ${pc.dim('installing')} ${p.name}...`);
      try {
        const ok = installPlugin(p.name, p.marketplace, 'project');
        if (ok) {
          process.stdout.write(`\r  ${pc.green('✓')} ${p.name}\n`);
          succeeded.push(p.name);
        } else {
          process.stdout.write(`\r  ${pc.red('✗')} ${p.name}\n`);
          failed.push(p.name);
        }
      } catch {
        process.stdout.write(`\r  ${pc.red('✗')} ${p.name}\n`);
        failed.push(p.name);
      }
    }

    console.log('');
    if (failed.length > 0) {
      log.warn(`Failed to install: ${failed.join(', ')}`);
      log.info('Run with ' + pc.cyan('DEBUG=skillme') + ' for more details.');
    }

    outro(
      succeeded.length > 0
        ? pc.green(`${succeeded.length} plugin(s) installed.`) +
          ' Run ' + pc.cyan('/reload-plugins') + ' in Claude Code to activate.'
        : 'Nothing was installed.'
    );

  } catch (err) {
    if (err instanceof SkillmeError) {
      log.error(err.message);
    } else {
      logger.error('Unexpected error in sync', err);
      log.error('Something went wrong. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    process.exit(1);
  }
}
