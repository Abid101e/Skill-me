import type { IndexData, Plugin } from './types';

export const STACK_META: Record<string, { displayName: string; category: string; rgbaColor: string }> = {
  nextjs:       { displayName: 'Next.js',    category: 'Frontend', rgbaColor: '59,130,246'  },
  react:        { displayName: 'React',      category: 'Frontend', rgbaColor: '59,130,246'  },
  vue:          { displayName: 'Vue',        category: 'Frontend', rgbaColor: '59,130,246'  },
  nuxt:         { displayName: 'Nuxt',       category: 'Frontend', rgbaColor: '59,130,246'  },
  svelte:       { displayName: 'Svelte',     category: 'Frontend', rgbaColor: '59,130,246'  },
  typescript:   { displayName: 'TypeScript', category: 'Language', rgbaColor: '139,92,246'  },
  node:         { displayName: 'Node.js',    category: 'Backend',  rgbaColor: '16,185,129'  },
  express:      { displayName: 'Express',    category: 'Backend',  rgbaColor: '16,185,129'  },
  fastify:      { displayName: 'Fastify',    category: 'Backend',  rgbaColor: '16,185,129'  },
  nestjs:       { displayName: 'NestJS',     category: 'Backend',  rgbaColor: '16,185,129'  },
  prisma:       { displayName: 'Prisma',     category: 'Database', rgbaColor: '245,158,11'  },
  python:       { displayName: 'Python',     category: 'Language', rgbaColor: '139,92,246'  },
  fastapi:      { displayName: 'FastAPI',    category: 'Backend',  rgbaColor: '16,185,129'  },
  django:       { displayName: 'Django',     category: 'Backend',  rgbaColor: '16,185,129'  },
  flask:        { displayName: 'Flask',      category: 'Backend',  rgbaColor: '16,185,129'  },
  go:           { displayName: 'Go',         category: 'Language', rgbaColor: '139,92,246'  },
  rust:         { displayName: 'Rust',       category: 'Language', rgbaColor: '139,92,246'  },
  'github-ci':  { displayName: 'GitHub CI',  category: 'DevOps',   rgbaColor: '14,165,233'  },
  docker:       { displayName: 'Docker',     category: 'DevOps',   rgbaColor: '14,165,233'  },
  'plugin-dev': { displayName: 'Plugin Dev', category: 'Meta',     rgbaColor: '161,161,170' },
};

export const CATEGORY_STYLE: Record<string, {
  dot: string; text: string; hoverText: string;
  badge: string; sectionText: string; rgbaColor: string;
}> = {
  Frontend: { dot: 'bg-blue-400',    text: 'text-blue-400',    hoverText: 'group-hover:text-blue-400',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    sectionText: 'text-blue-400',    rgbaColor: '59,130,246'  },
  Backend:  { dot: 'bg-emerald-400', text: 'text-emerald-400', hoverText: 'group-hover:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', sectionText: 'text-emerald-400', rgbaColor: '16,185,129'  },
  Language: { dot: 'bg-violet-400',  text: 'text-violet-400',  hoverText: 'group-hover:text-violet-400',  badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',  sectionText: 'text-violet-400',  rgbaColor: '139,92,246'  },
  Database: { dot: 'bg-amber-400',   text: 'text-amber-400',   hoverText: 'group-hover:text-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   sectionText: 'text-amber-400',   rgbaColor: '245,158,11'  },
  DevOps:   { dot: 'bg-sky-400',     text: 'text-sky-400',     hoverText: 'group-hover:text-sky-400',     badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',     sectionText: 'text-sky-400',     rgbaColor: '14,165,233'  },
  Meta:     { dot: 'bg-zinc-400',    text: 'text-zinc-400',    hoverText: 'group-hover:text-zinc-400',    badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',    sectionText: 'text-zinc-400',    rgbaColor: '161,161,170' },
};

export const CATEGORY_ORDER = ['Frontend', 'Backend', 'Language', 'Database', 'DevOps', 'Meta'];

export interface StackInfo {
  id: string;
  displayName: string;
  category: string;
  rgbaColor: string;
  plugins: Plugin[];
}

export function getAllStacks(data: IndexData): StackInfo[] {
  return Object.entries(data.recommendations).map(([id, pluginNames]) => {
    const meta = STACK_META[id] ?? { displayName: id, category: 'Other', rgbaColor: '161,161,170' };
    const plugins = pluginNames
      .map(name => findPlugin(data, name))
      .filter((p): p is Plugin => p !== undefined);
    return { id, ...meta, plugins };
  });
}

export function getStack(data: IndexData, id: string): StackInfo | undefined {
  const pluginNames = data.recommendations[id];
  if (!pluginNames) return undefined;
  const meta = STACK_META[id] ?? { displayName: id, category: 'Other', rgbaColor: '161,161,170' };
  return {
    id,
    ...meta,
    plugins: pluginNames
      .map(name => findPlugin(data, name))
      .filter((p): p is Plugin => p !== undefined),
  };
}

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

export function getAllPlugins(data: IndexData): Plugin[] {
  return Object.entries(data.plugins).map(([name, p]) => ({ name, ...p }));
}

export function findPlugin(data: IndexData, name: string): Plugin | undefined {
  const entry = data.plugins[name];
  if (!entry) return undefined;
  return { name, ...entry };
}

export function getStacksForPlugin(data: IndexData, pluginName: string): string[] {
  return Object.entries(data.recommendations)
    .filter(([, plugins]) => plugins.includes(pluginName))
    .map(([stack]) => stack);
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
