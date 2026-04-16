import fs from 'fs';
import path from 'path';
import os from 'os';
import bundledData from '../../data/index.json';
import { logger } from '../utils/logger.js';

export interface Plugin {
  name: string;
  marketplace: string;
  description: string;
  tags: string[];
  trusted: boolean;
  requiresBinary?: string;
}

export interface Marketplace {
  id: string;
  repo: string;
  trusted: boolean;
  description: string;
}

export interface IndexData {
  version: string;
  indexUrl: string;
  cacheTtlMinutes: number;
  marketplaces: Marketplace[];
  plugins: Record<string, Omit<Plugin, 'name'>>;
  recommendations: Record<string, string[]>;
}

interface GitHubEntry {
  name: string;
  type: 'file' | 'dir';
}

interface GitHubPluginJson {
  name?: string;
  description?: string;
  keywords?: string[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CACHE_PATH = path.join(os.homedir(), '.skillme', 'cache.json');
const CACHE_TTL_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;
const MAX_CONCURRENT_REQUESTS = 5;
const VALID_REPO_RE = /^[\w-]+\/[\w.-]+$/;
const VALID_INDEX_URL_RE = /^https:\/\/raw\.githubusercontent\.com\//;

// ─── Cache ─────────────────────────────────────────────────────────────────────

try {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  logger.debug(`Cache directory ready: ${path.dirname(CACHE_PATH)}`);
} catch (err) {
  logger.warn(`Could not create cache directory: ${String(err)}`);
}

function isValidIndexData(raw: unknown): raw is IndexData {
  if (typeof raw !== 'object' || raw === null) return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r['version'] === 'string' &&
    typeof r['indexUrl'] === 'string' &&
    Array.isArray(r['marketplaces']) &&
    typeof r['plugins'] === 'object' && r['plugins'] !== null &&
    typeof r['recommendations'] === 'object' && r['recommendations'] !== null
  );
}

function loadCached(): IndexData | null {
  try {
    if (!fs.existsSync(CACHE_PATH)) {
      logger.debug('No cache file found');
      return null;
    }
    const raw: unknown = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    if (typeof raw !== 'object' || raw === null) {
      logger.warn('Cache file is malformed — discarding');
      return null;
    }
    const r = raw as Record<string, unknown>;
    const ageMs = Date.now() - (typeof r['_cachedAt'] === 'number' ? r['_cachedAt'] : 0);
    if (ageMs > CACHE_TTL_MS) {
      logger.debug(`Cache expired (age: ${Math.round(ageMs / 60000)}min)`);
      return null;
    }
    if (!isValidIndexData(raw)) {
      logger.warn('Cache schema invalid — discarding');
      return null;
    }
    logger.debug(`Cache hit — ${Object.keys(raw.plugins).length} plugins loaded`);
    return raw;
  } catch (err) {
    logger.warn(`Failed to read cache: ${String(err)}`);
    return null;
  }
}

function saveCache(data: IndexData): void {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify({ ...data, _cachedAt: Date.now() }));
    logger.debug(`Cache saved — ${Object.keys(data.plugins).length} plugins`);
  } catch (err) {
    logger.warn(`Could not write cache: ${String(err)}`);
  }
}

// ─── GitHub crawler ────────────────────────────────────────────────────────────

async function githubFetch<T>(url: string): Promise<T | null> {
  logger.debug(`GET ${url}`);
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (process.env['GITHUB_TOKEN']) {
    headers['Authorization'] = `Bearer ${process.env['GITHUB_TOKEN']}`;
  }
  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      logger.debug(`GitHub fetch failed: ${res.status} ${url}`);
      return null;
    }
    return await res.json() as T;
  } catch (err) {
    logger.debug(`GitHub fetch error: ${String(err)} — ${url}`);
    return null;
  }
}

async function batchedAll<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency).map(fn => fn());
    results.push(...await Promise.all(batch));
  }
  return results;
}

async function crawlMarketplace(
  marketplace: Marketplace
): Promise<Record<string, Omit<Plugin, 'name'>>> {
  const { id: marketplaceId, repo, trusted } = marketplace;

  if (!VALID_REPO_RE.test(repo)) {
    logger.warn(`Skipping marketplace "${marketplaceId}" — invalid repo format: ${repo}`);
    return {};
  }

  logger.debug(`Crawling marketplace: ${marketplaceId} (${repo})`);
  const discovered: Record<string, Omit<Plugin, 'name'>> = {};
  const folders = ['plugins', 'external_plugins'];

  for (const folder of folders) {
    const url = `https://api.github.com/repos/${repo}/contents/${folder}`;
    const entries = await githubFetch<GitHubEntry[]>(url);

    if (!entries || !Array.isArray(entries)) {
      logger.debug(`No entries found in ${repo}/${folder}`);
      continue;
    }

    const dirs = entries.filter(e => e.type === 'dir' && VALID_REPO_RE.test(`x/${e.name}`));
    logger.debug(`Found ${dirs.length} plugins in ${repo}/${folder}`);

    const tasks = dirs.map(dir => async () => {
      const pluginJsonUrl =
        `https://raw.githubusercontent.com/${repo}/main/${folder}/${dir.name}/.claude-plugin/plugin.json`;
      const meta = await githubFetch<GitHubPluginJson>(pluginJsonUrl);
      return { dir, meta };
    });

    const results = await batchedAll(tasks, MAX_CONCURRENT_REQUESTS);

    for (const { dir, meta } of results) {
      if (discovered[dir.name]) continue;
      discovered[dir.name] = {
        marketplace: marketplaceId,
        description: meta?.description ?? `Plugin from ${marketplaceId}`,
        tags: Array.isArray(meta?.keywords) ? meta.keywords : [],
        trusted,
      };
    }
  }

  logger.debug(`Crawled ${marketplaceId}: ${Object.keys(discovered).length} plugins found`);
  return discovered;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function fetchIndex(forceRefresh = false): Promise<IndexData> {
  if (!forceRefresh) {
    const cached = loadCached();
    if (cached) return cached;
  }

  logger.debug('Fetching fresh index...');
  let base: IndexData = bundledData as unknown as IndexData;

  if (VALID_INDEX_URL_RE.test(base.indexUrl)) {
    try {
      const res = await fetch(base.indexUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (res.ok) {
        const fetched: unknown = await res.json();
        if (isValidIndexData(fetched)) {
          base = fetched;
          logger.debug(`Remote index loaded — version ${base.version}`);
        } else {
          logger.warn('Remote index failed schema validation — using bundled fallback');
        }
      } else {
        logger.warn(`Remote index returned ${res.status} — using bundled fallback`);
      }
    } catch (err) {
      logger.warn(`Could not reach remote index: ${String(err)} — using bundled fallback`);
    }
  } else {
    logger.warn('indexUrl is not a trusted GitHub raw URL — skipping remote fetch');
  }

  logger.debug(`Crawling ${base.marketplaces.length} marketplace(s) live...`);
  const crawlResults = await Promise.allSettled(base.marketplaces.map(m => crawlMarketplace(m)));

  const livePlugins: Record<string, Omit<Plugin, 'name'>> = {};
  for (const [i, result] of crawlResults.entries()) {
    if (result.status === 'fulfilled') {
      Object.assign(livePlugins, result.value);
    } else {
      const marketplace = base.marketplaces[i];
      logger.warn(`Marketplace crawl failed for "${marketplace?.id}" — skipping: ${String(result.reason)}`);
    }
  }

  const merged: Record<string, Omit<Plugin, 'name'>> = { ...livePlugins, ...base.plugins };
  logger.debug(`Merged index: ${Object.keys(merged).length} total plugins`);

  const data: IndexData = { ...base, plugins: merged };
  saveCache(data);
  return data;
}

export function getPlugins(data: IndexData): Plugin[] {
  return Object.entries(data.plugins).map(([name, p]) => ({ name, ...p }));
}

export function searchPlugins(data: IndexData, query: string): Plugin[] {
  const q = query.toLowerCase();
  const plugins = getPlugins(data);

  const scored = plugins.map(p => {
    let score = 0;
    if (p.name.toLowerCase().includes(q))        score += 30;
    if (p.description.toLowerCase().includes(q)) score += 20;
    if (p.tags?.some(t => t.includes(q)))         score += 15;
    if (p.trusted)                                score += 10;
    return { plugin: p, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.plugin);
}

export function findPlugin(data: IndexData, name: string): Plugin | undefined {
  const entry = data.plugins[name];
  if (!entry) return undefined;
  return { name, ...entry };
}
