import { intro, outro, spinner } from '@clack/prompts';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import { isClaudeInstalled } from '../installer/index.js';
import { fetchIndex } from '../marketplace/index.js';
import { logger } from '../utils/logger.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ok(msg: string)   { console.log(`  ${pc.green('✓')}  ${msg}`); }
function fail(msg: string) { console.log(`  ${pc.red('✗')}  ${msg}`); }
function warn(msg: string) { console.log(`  ${pc.yellow('!')}  ${msg}`); }
function info(msg: string) { console.log(`  ${pc.dim('·')}  ${pc.dim(msg)}`); }

function isBinaryAvailable(bin: string): boolean {
  const result = spawnSync(bin, ['--version'], {
    shell: false,
    stdio: 'pipe',
    timeout: 3000,
  });
  return result.status === 0 || result.error === undefined && result.status !== null;
}

function readInstalledPlugins(): {
  user: string[];
  project: string[];
  local: string[];
} {
  function read(filePath: string): string[] {
    try {
      if (!fs.existsSync(filePath)) return [];
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
      const ep = raw['enabledPlugins'];
      if (typeof ep !== 'object' || ep === null) return [];
      return Object.keys(ep as Record<string, unknown>);
    } catch {
      return [];
    }
  }

  return {
    user:    read(path.join(os.homedir(), '.claude', 'settings.json')),
    project: read(path.join(process.cwd(), '.claude', 'settings.json')),
    local:   read(path.join(process.cwd(), '.claude', 'settings.local.json')),
  };
}

function stripScope(raw: string): string {
  const at = raw.lastIndexOf('@');
  return at > 0 ? raw.slice(0, at) : raw;
}

function nodeVersion(): { major: number; ok: boolean } {
  const v = process.versions.node;
  const major = parseInt(v.split('.')[0] ?? '0', 10);
  return { major, ok: major >= 18 };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export async function runDoctor() {
  intro(pc.bold(pc.cyan('skillme doctor') + ' — system diagnostics'));

  let issues = 0;

  // ── 1. Node version ──
  console.log(`\n  ${pc.bold('Environment')}`);
  const node = nodeVersion();
  if (node.ok) {
    ok(`Node.js v${process.versions.node}`);
  } else {
    fail(`Node.js v${process.versions.node} — requires >=18`);
    issues++;
  }

  // ── 2. Claude CLI ──
  if (isClaudeInstalled()) {
    const res = spawnSync('claude', ['--version'], { shell: false, stdio: 'pipe' });
    const version = res.stdout?.toString().trim() ?? 'unknown';
    ok(`Claude Code CLI — ${version}`);
  } else {
    fail('Claude Code CLI not found');
    info('Install it from: https://claude.ai/download');
    issues++;
  }

  // ── 3. Installed plugins ──
  const installed = readInstalledPlugins();
  const allInstalled = [
    ...installed.user.map(p => ({ name: stripScope(p), scope: 'user' })),
    ...installed.project.map(p => ({ name: stripScope(p), scope: 'project' })),
    ...installed.local.map(p => ({ name: stripScope(p), scope: 'local' })),
  ];

  console.log(`\n  ${pc.bold('Installed plugins')} ${pc.dim(`(${allInstalled.length} total)`)}`);

  if (allInstalled.length === 0) {
    warn('No plugins installed — run ' + pc.cyan('skillme init') + ' to get started');
  }

  // ── 4. Binary requirements check ──
  if (allInstalled.length > 0) {
    const s = spinner();
    s.start('Checking plugin requirements');

    let indexData: Awaited<ReturnType<typeof fetchIndex>> | null = null;
    try {
      indexData = await fetchIndex();
    } catch (err) {
      logger.debug(`Could not fetch index for doctor: ${String(err)}`);
    }

    s.stop('');

    for (const { name, scope } of allInstalled) {
      const meta = indexData?.plugins[name];
      const requiredBin = meta?.requiresBinary;

      if (requiredBin) {
        const binOk = isBinaryAvailable(requiredBin);
        if (binOk) {
          ok(`${pc.bold(name)} ${pc.dim(`(${scope})`)}  — ${pc.dim(`requires ${requiredBin} ✓`)}`);
        } else {
          fail(`${pc.bold(name)} ${pc.dim(`(${scope})`)}  — missing binary: ${pc.yellow(requiredBin)}`);
          issues++;
        }
      } else {
        ok(`${pc.bold(name)} ${pc.dim(`(${scope})`)}`);
      }
    }
  }

  // ── 5. Settings file integrity ──
  console.log(`\n  ${pc.bold('Settings files')}`);

  const settingsFiles = [
    { label: 'user',    filePath: path.join(os.homedir(), '.claude', 'settings.json') },
    { label: 'project', filePath: path.join(process.cwd(), '.claude', 'settings.json') },
    { label: 'local',   filePath: path.join(process.cwd(), '.claude', 'settings.local.json') },
  ];

  for (const { label, filePath } of settingsFiles) {
    if (!fs.existsSync(filePath)) {
      info(`${label}: not found (${filePath})`);
      continue;
    }
    try {
      JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      ok(`${label}: ${pc.dim(filePath)}`);
    } catch {
      fail(`${label}: invalid JSON — ${pc.dim(filePath)}`);
      issues++;
    }
  }

  // ── Summary ──
  console.log('');
  if (issues === 0) {
    outro(pc.green('All checks passed.'));
  } else {
    outro(pc.yellow(`${issues} issue(s) found — see above for details.`));
  }
}
