/**
 * scripts/refresh-index.ts
 *
 * Crawls all configured marketplaces, merges the results, and writes
 * a fresh data/index.json to the repo root. Run via GitHub Actions
 * (or locally with `npx tsx scripts/refresh-index.ts`).
 *
 * Set GITHUB_TOKEN env var to avoid GitHub API rate limits in CI.
 */

import { fetchIndex } from '../src/marketplace/index.js';
import fs from 'fs';
import path from 'path';

async function main() {
  const OUT_PATH = path.resolve(process.cwd(), 'data/index.json');

  console.log('skillme · refreshing plugin index...\n');

  const data = await fetchIndex(/* forceRefresh */ true);

  const pluginCount = Object.keys(data.plugins).length;
  const version = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  const refreshed = { ...data, version };

  fs.writeFileSync(OUT_PATH, JSON.stringify(refreshed, null, 2) + '\n');

  console.log(`\n✓  ${pluginCount} plugins written to data/index.json`);
  console.log(`   version: ${version}`);
  console.log(`   marketplaces: ${data.marketplaces.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
