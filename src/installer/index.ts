import { spawnSync } from 'child_process';
import pc from 'picocolors';
import { logger } from '../utils/logger.js';
import { ClaudeNotFoundError, InstallError, InvalidInputError } from '../utils/errors.js';

export type Scope = 'user' | 'project' | 'local';

const VALID_SCOPES = new Set<string>(['user', 'project', 'local']);
const VALID_NAME_RE = /^[\w][\w.-]*$/;
const VALID_MARKETPLACE_RE = /^[\w-]+$/;

export function validateScope(scope: string): scope is Scope {
  return VALID_SCOPES.has(scope);
}

export function validatePluginName(name: string): boolean {
  return VALID_NAME_RE.test(name) && name.length <= 128;
}

export function validateMarketplaceId(id: string): boolean {
  return VALID_MARKETPLACE_RE.test(id) && id.length <= 128;
}

export function isClaudeInstalled(): boolean {
  const result = spawnSync('claude', ['--version'], { shell: false });
  const ok = result.status === 0;
  logger.debug(`Claude CLI check: ${ok ? 'found' : 'not found'}`);
  return ok;
}

export function assertClaudeInstalled(): void {
  if (!isClaudeInstalled()) throw new ClaudeNotFoundError();
}

export function addMarketplace(repo: string): void {
  logger.debug(`Adding marketplace: ${repo}`);
  const result = spawnSync(
    'claude',
    ['plugin', 'marketplace', 'add', repo],
    { shell: false, stdio: 'pipe' }
  );
  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim();
    logger.debug(`Marketplace add failed: ${stderr}`);
    // non-fatal — marketplace may already be registered
  } else {
    logger.debug(`Marketplace added: ${repo}`);
  }
}

export function installPlugin(name: string, marketplace: string, scope: Scope): boolean {
  if (!validatePluginName(name)) {
    throw new InvalidInputError('plugin name', name);
  }
  if (!validateMarketplaceId(marketplace)) {
    throw new InvalidInputError('marketplace id', marketplace);
  }
  if (!validateScope(scope)) {
    throw new InvalidInputError('scope', scope, 'Must be: user | project | local');
  }

  logger.debug(`Installing ${name}@${marketplace} --scope ${scope}`);

  const result = spawnSync(
    'claude',
    ['plugin', 'install', `${name}@${marketplace}`, '--scope', scope],
    { shell: false, stdio: 'inherit' }
  );

  if (result.status !== 0) {
    logger.debug(`Install failed for ${name}: exit code ${result.status ?? 'unknown'}`);
    return false;
  }

  logger.debug(`Installed ${name} successfully`);
  return true;
}

export function installPlugins(
  plugins: Array<{ name: string; marketplace: string }>,
  scope: Scope
): { installed: string[]; failed: string[] } {
  const installed: string[] = [];
  const failed: string[] = [];

  logger.debug(`Installing ${plugins.length} plugin(s) with scope: ${scope}`);

  const marketplaces = new Set(plugins.map(p => p.marketplace));
  for (const marketplace of marketplaces) {
    addMarketplace(marketplace);
  }

  for (const plugin of plugins) {
    process.stdout.write(`  ${pc.dim('installing')} ${plugin.name}...`);
    try {
      const ok = installPlugin(plugin.name, plugin.marketplace, scope);
      if (ok) {
        process.stdout.write(`\r  ${pc.green('✓')} ${plugin.name}\n`);
        installed.push(plugin.name);
      } else {
        process.stdout.write(`\r  ${pc.red('✗')} ${plugin.name}\n`);
        logger.warn(`Install returned non-zero for ${plugin.name}`);
        failed.push(plugin.name);
      }
    } catch (err) {
      process.stdout.write(`\r  ${pc.red('✗')} ${plugin.name}\n`);
      if (err instanceof InstallError || err instanceof InvalidInputError) {
        logger.warn(err.message);
      } else {
        logger.error(`Unexpected error installing ${plugin.name}`, err);
      }
      failed.push(plugin.name);
    }
  }

  logger.debug(`Install complete — ${installed.length} succeeded, ${failed.length} failed`);
  return { installed, failed };
}
