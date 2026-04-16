import { spawnSync } from 'child_process';
import pc from 'picocolors';

export type Scope = 'user' | 'project' | 'local';

export function isClaudeInstalled(): boolean {
  const result = spawnSync('claude', ['--version'], { shell: true });
  return result.status === 0;
}

export function addMarketplace(repo: string): boolean {
  const result = spawnSync(
    'claude',
    ['plugin', 'marketplace', 'add', repo],
    { shell: true, stdio: 'pipe' }
  );
  return result.status === 0;
}

export function installPlugin(name: string, marketplace: string, scope: Scope): boolean {
  const result = spawnSync(
    'claude',
    ['plugin', 'install', `${name}@${marketplace}`, '--scope', scope],
    { shell: true, stdio: 'inherit' }
  );
  return result.status === 0;
}

export function installPlugins(
  plugins: Array<{ name: string; marketplace: string }>,
  scope: Scope
): { installed: string[]; failed: string[] } {
  const installed: string[] = [];
  const failed: string[] = [];

  const marketplaces = new Set(plugins.map(p => p.marketplace));
  for (const marketplace of marketplaces) {
    addMarketplace(marketplace);
  }

  for (const plugin of plugins) {
    process.stdout.write(`  ${pc.dim('installing')} ${plugin.name}...`);
    const ok = installPlugin(plugin.name, plugin.marketplace, scope);
    if (ok) {
      process.stdout.write(`\r  ${pc.green('✓')} ${plugin.name}\n`);
      installed.push(plugin.name);
    } else {
      process.stdout.write(`\r  ${pc.red('✗')} ${plugin.name}\n`);
      failed.push(plugin.name);
    }
  }

  return { installed, failed };
}
