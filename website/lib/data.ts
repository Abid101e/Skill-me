import type { IndexData, Plugin } from './types';

const INDEX_URL =
  'https://raw.githubusercontent.com/Abid101e/Skill-me/main/data/index.json';

export async function getIndexData(): Promise<IndexData> {
  const res = await fetch(INDEX_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch index: ${res.status}`);
  return res.json();
}

export function getFeaturedPlugins(data: IndexData): Plugin[] {
  return Object.entries(data.plugins)
    .filter(([, p]) => p.trusted)
    .map(([name, p]) => ({ name, ...p }))
    .slice(0, 9);
}

export function getCommunityPlugins(data: IndexData, limit = 6): Plugin[] {
  return Object.entries(data.plugins)
    .filter(([, p]) => !p.trusted && p.description !== `Plugin from ${p.marketplace}`)
    .map(([name, p]) => ({ name, ...p }))
    .slice(0, limit);
}

export function getStats(data: IndexData) {
  return {
    plugins: Object.keys(data.plugins).length,
    marketplaces: data.marketplaces.length,
    trusted: Object.values(data.plugins).filter(p => p.trusted).length,
  };
}
