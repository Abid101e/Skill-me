import fs from 'fs';
import path from 'path';

const DEPENDENCY_MAP: Record<string, string[]> = {
  next:            ['nextjs', 'react', 'typescript'],
  react:           ['react'],
  vue:             ['vue'],
  nuxt:            ['nuxt', 'vue'],
  '@sveltejs/kit': ['svelte'],
  svelte:          ['svelte'],
  express:         ['express', 'node'],
  fastify:         ['fastify', 'node'],
  '@nestjs/core':  ['nestjs', 'typescript'],
  '@prisma/client':['prisma'],
  typescript:      ['typescript'],
  tsx:             ['typescript'],
  'ts-node':       ['typescript'],
};

export function detectNode(cwd: string): string[] {
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) return [];

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    return [];
  }

  const deps = {
    ...((pkg.dependencies as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  };

  const tags = new Set<string>();
  tags.add('node');

  for (const [dep, detectedTags] of Object.entries(DEPENDENCY_MAP)) {
    if (deps[dep]) {
      detectedTags.forEach(t => tags.add(t));
    }
  }

  if (fs.existsSync(path.join(cwd, 'tsconfig.json'))) {
    tags.add('typescript');
  }

  return [...tags];
}
