import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

export interface AIRecommendation {
  name: string;
  reason: string;
}

interface ClaudeOutput {
  type?: string;
  result?: string;
  is_error?: boolean;
}

interface PluginEntry {
  description: string;
  trusted: boolean;
}

function buildProjectContext(cwd: string): string {
  const parts: string[] = [];

  // Root files (skip hidden, noise)
  try {
    const rootFiles = fs.readdirSync(cwd).filter(f => {
      if (f === 'node_modules' || f === '.git') return false;
      try { return !fs.statSync(path.join(cwd, f)).isDirectory(); }
      catch { return false; }
    }).slice(0, 30);
    if (rootFiles.length) parts.push(`Root files: ${rootFiles.join(', ')}`);
  } catch { /* ignore */ }

  // First-level directories
  try {
    const dirs = fs.readdirSync(cwd).filter(f => {
      if (f === 'node_modules' || f === '.git' || f.startsWith('.')) return false;
      try { return fs.statSync(path.join(cwd, f)).isDirectory(); }
      catch { return false; }
    }).slice(0, 12);
    if (dirs.length) parts.push(`Directories: ${dirs.join(', ')}`);
  } catch { /* ignore */ }

  // package.json — name + top deps
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
        name?: string;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).slice(0, 25);
      if (pkg.name) parts.push(`Project name: ${pkg.name}`);
      if (deps.length) parts.push(`npm deps: ${deps.join(', ')}`);
    } catch { /* ignore */ }
  }

  // Recent git log
  const gitLog = spawnSync('git', ['log', '--oneline', '-8'], {
    cwd, stdio: 'pipe', shell: false,
  });
  if (gitLog.status === 0) {
    const log = gitLog.stdout.toString().trim();
    if (log) parts.push(`Recent commits:\n${log}`);
  }

  return parts.join('\n\n');
}

export async function getAIRecommendations(
  cwd: string,
  plugins: Record<string, PluginEntry>,
  detectedTags: string[],
): Promise<AIRecommendation[] | null> {
  const context = buildProjectContext(cwd);

  const pluginList = Object.entries(plugins)
    .map(([name, p]) => {
      const desc = p.description.split('\n')[0].replace(/[#*`>_~]/g, '').trim().slice(0, 80);
      return `- ${name}: ${desc}`;
    })
    .join('\n');

  const prompt =
    `You are helping a developer pick Claude Code plugins for their project.\n\n` +
    `PROJECT CONTEXT:\n${context}\n\n` +
    `DETECTED STACK TAGS: ${detectedTags.join(', ') || 'unknown'}\n\n` +
    `AVAILABLE PLUGINS:\n${pluginList}\n\n` +
    `Choose the 5-8 most useful plugins for this specific project. ` +
    `For each, write a short one-line reason that references something concrete from the project ` +
    `(a dependency name, a directory, a commit pattern, a file type). ` +
    `Do not be generic. Mention specific things you see.\n\n` +
    `Reply with ONLY a valid JSON array, no markdown, no explanation:\n` +
    `[{"name":"plugin-name","reason":"specific reason"}]`;

  logger.debug('Calling claude -p for AI recommendations');

  const result = spawnSync(
    'claude',
    ['-p', prompt, '--output-format', 'json'],
    { shell: false, stdio: 'pipe', timeout: 45_000 },
  );

  if (result.status !== 0 || result.error) {
    logger.debug(`claude -p failed (exit ${result.status}): ${result.stderr?.toString().trim()}`);
    return null;
  }

  try {
    const raw = result.stdout.toString().trim();
    const outer: ClaudeOutput = JSON.parse(raw);

    if (outer.is_error || !outer.result) return null;

    // Claude might wrap with markdown fences — strip them
    const text = outer.result.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const recs = JSON.parse(jsonMatch[0]) as unknown[];
    if (!Array.isArray(recs)) return null;

    return recs
      .filter((r): r is AIRecommendation =>
        typeof r === 'object' && r !== null &&
        typeof (r as AIRecommendation).name === 'string' &&
        typeof (r as AIRecommendation).reason === 'string'
      )
      .filter(r => plugins[r.name])   // only plugins that actually exist in the index
      .slice(0, 8);

  } catch (err) {
    logger.debug(`Failed to parse AI response: ${err}`);
    return null;
  }
}
