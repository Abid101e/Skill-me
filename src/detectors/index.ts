import { detectNode } from './node.js';
import { detectPython } from './python.js';
import { detectGo } from './go.js';
import { detectRust } from './rust.js';
import { detectExtras } from './extras.js';

export interface DetectedStack {
  tags: string[];
  display: string[];
}

export function detectStack(cwd: string): DetectedStack {
  const allTags = new Set<string>([
    ...detectNode(cwd),
    ...detectPython(cwd),
    ...detectGo(cwd),
    ...detectRust(cwd),
    ...detectExtras(cwd),
  ]);

  const tags = [...allTags];

  const DISPLAY_NAMES: Record<string, string> = {
    nextjs:     'Next.js',
    react:      'React',
    vue:        'Vue',
    nuxt:       'Nuxt',
    svelte:     'Svelte',
    typescript: 'TypeScript',
    node:       'Node.js',
    express:    'Express',
    fastify:    'Fastify',
    nestjs:     'NestJS',
    prisma:     'Prisma',
    python:     'Python',
    fastapi:    'FastAPI',
    django:     'Django',
    flask:      'Flask',
    go:         'Go',
    rust:       'Rust',
    'github-ci':'GitHub Actions',
    docker:     'Docker',
  };

  const display = tags
    .filter(t => DISPLAY_NAMES[t])
    .map(t => DISPLAY_NAMES[t]);

  return { tags, display };
}
