import fs from 'fs';
import path from 'path';

// Keyword → tags mapping. Only fires when no other detector found the tag already.
// Checked case-insensitively against README content.
const KEYWORD_MAP: Array<{ pattern: RegExp; tags: string[] }> = [
  { pattern: /\bnext\.?js\b/i,              tags: ['nextjs', 'react', 'typescript'] },
  { pattern: /\breact\b/i,                  tags: ['react'] },
  { pattern: /\bvue\.?js\b|\bvue\b/i,      tags: ['vue'] },
  { pattern: /\bnuxt\b/i,                   tags: ['nuxt', 'vue'] },
  { pattern: /\bsvelte\b/i,                 tags: ['svelte'] },
  { pattern: /\btypescript\b/i,             tags: ['typescript'] },
  { pattern: /\bnode\.?js\b/i,              tags: ['node'] },
  { pattern: /\bexpress\b/i,               tags: ['express', 'node'] },
  { pattern: /\bfastify\b/i,               tags: ['fastify', 'node'] },
  { pattern: /\bnestjs\b|\bnest\.?js\b/i,  tags: ['nestjs', 'typescript'] },
  { pattern: /\bprisma\b/i,                tags: ['prisma'] },
  { pattern: /\bpython\b/i,                tags: ['python'] },
  { pattern: /\bfastapi\b/i,               tags: ['fastapi', 'python'] },
  { pattern: /\bdjango\b/i,                tags: ['django', 'python'] },
  { pattern: /\bflask\b/i,                 tags: ['flask', 'python'] },
  { pattern: /\bgolang\b|\bgo\s+(?:api|server|service|backend)\b/i, tags: ['go'] },
  { pattern: /\bgin[-\s]gonic\b|\bgin\s+framework\b/i, tags: ['gin', 'go'] },
  { pattern: /\bfiber\b.*\bgo\b|\bgo\b.*\bfiber\b/i,   tags: ['fiber', 'go'] },
  { pattern: /\becho\b.*\bgo\b|\bgo\b.*\becho\b/i,     tags: ['echo', 'go'] },
  { pattern: /\brust\b/i,                  tags: ['rust'] },
  { pattern: /\bactix\b/i,                tags: ['actix', 'rust'] },
  { pattern: /\baxum\b/i,                 tags: ['axum', 'rust'] },
  { pattern: /\brocket\b.*\brust\b|\brust\b.*\brocket\b/i, tags: ['rocket', 'rust'] },
  { pattern: /\bc#\b|\.net\b|dotnet\b|asp\.net\b/i,    tags: ['csharp'] },
  { pattern: /\bjava\b(?!script)/i,        tags: ['java'] },
  { pattern: /\bspring\s+boot\b|\bspring\b/i, tags: ['spring', 'java'] },
  { pattern: /\bruby\b/i,                  tags: ['ruby'] },
  { pattern: /\brails\b|\bruby\s+on\s+rails\b/i, tags: ['rails', 'ruby'] },
  { pattern: /\bphp\b/i,                   tags: ['php'] },
  { pattern: /\blaravel\b/i,               tags: ['laravel', 'php'] },
  { pattern: /\bdocker\b/i,                tags: ['docker'] },
  { pattern: /\bgithub\s+actions\b/i,      tags: ['github-ci'] },
];

export function detectReadme(cwd: string, existingTags: Set<string>): string[] {
  const candidates = ['README.md', 'README.MD', 'readme.md', 'Readme.md'];
  let content: string | null = null;

  for (const name of candidates) {
    const p = path.join(cwd, name);
    if (fs.existsSync(p)) {
      try { content = fs.readFileSync(p, 'utf-8'); break; } catch { /* skip */ }
    }
  }

  if (!content) return [];

  const newTags = new Set<string>();

  for (const { pattern, tags } of KEYWORD_MAP) {
    if (pattern.test(content)) {
      tags.forEach(t => {
        if (!existingTags.has(t)) newTags.add(t);
      });
    }
  }

  return [...newTags];
}
