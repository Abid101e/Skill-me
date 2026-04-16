import { intro, outro, multiselect, select, spinner, log, cancel, isCancel } from '@clack/prompts';
import pc from 'picocolors';
import { detectStack } from '../detectors/index.js';
import { assertClaudeInstalled, installPlugins, type Scope } from '../installer/index.js';
import { fetchIndex } from '../marketplace/index.js';
import { logger } from '../utils/logger.js';
import { SkillmeError } from '../utils/errors.js';
import indexData from '../../data/index.json';

interface PluginEntry {
  marketplace: string;
  description: string;
  trusted: boolean;
  requiresBinary?: string;
}

type BundledData = {
  plugins: Record<string, PluginEntry>;
  recommendations: Record<string, string[]>;
};

const bundled = indexData as unknown as BundledData;

export async function runInit(options: { scope?: Scope }) {
  intro(pc.bold(pc.cyan('skillme') + ' — Claude Code plugin manager'));

  try {
    assertClaudeInstalled();

    const s = spinner();
    s.start('Detecting your project stack');
    const { tags, display } = detectStack(process.cwd());
    s.stop('Stack detected');

    logger.debug(`Detected tags: ${tags.join(', ')}`);

    if (display.length === 0) {
      log.warn('Could not detect a known stack in this directory.');
      log.info('Try running from your project root, or use ' + pc.cyan('skillme search <query>') + ' to browse plugins manually.');
      outro('');
      return;
    }

    log.info('Found:\n' + display.map(d => `  ${pc.green('→')} ${d}`).join('\n'));

    // use live index for richer data, fall back to bundled if fetch fails
    let recommendations: ReturnType<typeof getRecommendations>;
    try {
      const s2 = spinner();
      s2.start('Fetching plugin index');
      const liveData = await fetchIndex();
      s2.stop('Plugin index ready');
      recommendations = getRecommendations(tags, liveData.plugins as unknown as Record<string, PluginEntry>, liveData.recommendations);
    } catch (err) {
      logger.warn(`Could not fetch live index, using bundled data: ${String(err)}`);
      recommendations = getRecommendations(tags, bundled.plugins, bundled.recommendations);
    }

    if (recommendations.length === 0) {
      log.warn('No plugin recommendations found for your stack.');
      log.info('Use ' + pc.cyan('skillme search <query>') + ' to find plugins manually.');
      outro('');
      return;
    }

    const selected = await multiselect({
      message: 'Recommended plugins for your stack (space to toggle, enter to install):',
      options: recommendations.map(p => ({
        value: p.name,
        label: `${pc.bold(p.name)}  ${pc.dim(p.description)}`,
        hint: p.trusted ? pc.green('official') : pc.yellow('community'),
      })),
      initialValues: recommendations.map(p => p.name),
    });

    if (isCancel(selected) || (selected as string[]).length === 0) {
      cancel('No plugins selected. Nothing installed.');
      return;
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
      if (isCancel(choice)) { cancel('Cancelled.'); process.exit(0); }
      return choice as Scope;
    })();

    console.log('');
    const toInstall = (selected as string[]).map(name => ({
      name,
      marketplace: bundled.plugins[name]?.marketplace ?? 'claude-plugins-official',
    }));

    const { installed, failed } = installPlugins(toInstall, scope);
    console.log('');

    if (installed.length > 0) {
      const binWarnings = (selected as string[])
        .map(name => bundled.plugins[name]?.requiresBinary)
        .filter((b): b is string => Boolean(b));

      if (binWarnings.length > 0) {
        log.warn(
          'Some plugins require a binary:\n' +
          binWarnings.map(b => `  ${pc.cyan(b)}`).join('\n')
        );
      }
    }

    if (failed.length > 0) {
      log.warn(`Failed to install: ${failed.join(', ')}`);
      log.info('Run with ' + pc.cyan('DEBUG=skillme') + ' for more details.');
    }

    outro(
      installed.length > 0
        ? pc.green(`${installed.length} plugin(s) installed.`) + ' Run ' + pc.cyan('/reload-plugins') + ' in Claude Code to activate.'
        : 'Nothing was installed.'
    );

  } catch (err) {
    if (err instanceof SkillmeError) {
      log.error(err.message);
    } else {
      logger.error('Unexpected error in init', err);
      log.error('Something went wrong. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    process.exit(1);
  }
}

function getRecommendations(
  tags: string[],
  plugins: Record<string, PluginEntry>,
  recommendations: Record<string, string[]>
) {
  const seen = new Set<string>();
  const result: Array<{ name: string; description: string; trusted: boolean }> = [];

  for (const tag of tags) {
    for (const name of (recommendations[tag] ?? [])) {
      if (seen.has(name)) continue;
      seen.add(name);
      const plugin = plugins[name];
      if (!plugin) continue;
      result.push({ name, description: plugin.description, trusted: plugin.trusted });
    }
  }

  return result;
}
