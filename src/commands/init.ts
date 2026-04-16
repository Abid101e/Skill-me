import { intro, outro, multiselect, select, spinner, log, cancel, isCancel } from '@clack/prompts';
import pc from 'picocolors';
import { detectStack } from '../detectors/index.js';
import { isClaudeInstalled, installPlugins, type Scope } from '../installer/index.js';
import indexData from '../../data/index.json';

interface PluginEntry {
  marketplace: string;
  description: string;
  trusted: boolean;
  requiresBinary?: string;
}

type IndexData = {
  plugins: Record<string, PluginEntry>;
  recommendations: Record<string, string[]>;
};

const data = indexData as unknown as IndexData;

export async function runInit(options: { scope?: Scope }) {
  intro(pc.bold(pc.cyan('skillme') + ' — Claude Code plugin manager'));

  if (!isClaudeInstalled()) {
    log.error('Claude Code CLI not found. Install it from https://claude.ai/code');
    process.exit(1);
  }

  const s = spinner();
  s.start('Detecting your project stack');
  const { tags, display } = detectStack(process.cwd());
  s.stop('Stack detected');

  if (display.length === 0) {
    log.warn('Could not detect a known stack in this directory.');
    log.info('Try running from your project root, or use ' + pc.cyan('skillme search <query>') + ' to find plugins manually.');
    process.exit(0);
  }

  log.info('Found:\n' + display.map(d => `  ${pc.green('→')} ${d}`).join('\n'));

  const recommended = getRecommendations(tags);

  if (recommended.length === 0) {
    log.warn('No plugin recommendations found for your stack.');
    log.info('Use ' + pc.cyan('skillme search <query>') + ' to find plugins manually.');
    process.exit(0);
  }

  const selected = await multiselect({
    message: 'Recommended plugins for your stack (space to toggle, enter to install):',
    options: recommended.map(p => ({
      value: p.name,
      label: `${pc.bold(p.name)}  ${pc.dim(p.description)}`,
      hint: p.trusted ? pc.green('official') : pc.yellow('community'),
    })),
    initialValues: recommended.map(p => p.name),
  });

  if (isCancel(selected) || selected.length === 0) {
    cancel('No plugins selected. Nothing installed.');
    process.exit(0);
  }

  const scope: Scope = options.scope ?? await (async () => {
    const choice = await select({
      message: 'Install scope:',
      options: [
        { value: 'project', label: 'project', hint: 'shared with team via .claude/settings.json' },
        { value: 'user',    label: 'user',    hint: 'only you, across all projects' },
        { value: 'local',   label: 'local',   hint: 'only you, this project, gitignored' },
      ],
    });
    if (isCancel(choice)) {
      cancel('Cancelled.');
      process.exit(0);
    }
    return choice as Scope;
  })();

  console.log('');
  const toInstall = (selected as string[]).map(name => ({
    name,
    marketplace: data.plugins[name]?.marketplace ?? 'claude-plugins-official',
  }));

  const { installed, failed } = installPlugins(toInstall, scope);

  console.log('');

  if (installed.length > 0) {
    const binWarnings = (selected as string[])
      .map(name => data.plugins[name]?.requiresBinary)
      .filter((b): b is string => Boolean(b));

    if (binWarnings.length > 0) {
      log.warn(
        'Some plugins require a binary:\n' +
        binWarnings.map(b => `  npm install -g ${b}  ${pc.dim('(or see plugin docs)')}`).join('\n')
      );
    }
  }

  if (failed.length > 0) {
    log.warn(`Failed to install: ${failed.join(', ')}`);
  }

  outro(
    installed.length > 0
      ? pc.green(`${installed.length} plugin(s) installed.`) + ' Run ' + pc.cyan('/reload-plugins') + ' inside Claude Code to activate.'
      : 'Nothing was installed.'
  );
}

function getRecommendations(tags: string[]) {
  const seen = new Set<string>();
  const result: Array<{ name: string; description: string; trusted: boolean }> = [];

  for (const tag of tags) {
    const pluginNames = data.recommendations[tag] ?? [];
    for (const name of pluginNames) {
      if (seen.has(name)) continue;
      seen.add(name);
      const plugin = data.plugins[name];
      if (!plugin) continue;
      result.push({ name, description: plugin.description, trusted: plugin.trusted });
    }
  }

  return result;
}
