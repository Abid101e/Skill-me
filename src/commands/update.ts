import { intro, outro, spinner, log } from '@clack/prompts';
import pc from 'picocolors';
import { fetchIndex } from '../marketplace/index.js';
import { logger } from '../utils/logger.js';
import { SkillmeError } from '../utils/errors.js';

export async function runUpdate() {
  intro(pc.bold(pc.cyan('skillme update') + ' — refreshing marketplace index'));

  try {
    const s = spinner();
    s.start('Fetching latest index from GitHub');

    const data = await fetchIndex(true);
    s.stop(`Index updated to v${data.version}`);

    const pluginCount = Object.keys(data.plugins).length;
    const marketplaceCount = data.marketplaces.length;

    log.info(`${pluginCount} plugins across ${marketplaceCount} marketplace(s).`);
    logger.debug(`Marketplaces: ${data.marketplaces.map(m => m.id).join(', ')}`);

    outro(pc.green('Done.') + ' Run ' + pc.cyan('skillme search <query>') + ' to explore.');

  } catch (err) {
    if (err instanceof SkillmeError) {
      log.error(err.message);
      log.warn('Using bundled index as fallback. Try again when online.');
    } else {
      logger.error('Unexpected error during update', err);
      log.error('Update failed. Run with ' + pc.cyan('DEBUG=skillme') + ' for details.');
    }
    outro('');
  }
}
