import fs from 'fs';
import path from 'path';

const PACKAGE_MAP: Record<string, string[]> = {
  'laravel/framework': ['laravel', 'php'],
  'symfony/symfony': ['symfony', 'php'],
  'slim/slim': ['slim', 'php'],
  'cakephp/cakephp': ['php'],
  'codeigniter4/framework': ['php'],
};

export function detectPHP(cwd: string): string[] {
  const tags = new Set<string>();

  const composerPath = path.join(cwd, 'composer.json');
  const hasPhpFiles = fs.readdirSync(cwd).some(f => f.endsWith('.php'));

  if (!fs.existsSync(composerPath) && !hasPhpFiles) return [];

  tags.add('php');

  if (fs.existsSync(composerPath)) {
    try {
      const composer = JSON.parse(fs.readFileSync(composerPath, 'utf-8'));
      const deps = {
        ...((composer.require as Record<string, string>) ?? {}),
        ...((composer['require-dev'] as Record<string, string>) ?? {}),
      };
      for (const [pkg, detectedTags] of Object.entries(PACKAGE_MAP)) {
        if (deps[pkg]) {
          detectedTags.forEach(t => tags.add(t));
        }
      }
    } catch {
      // skip unreadable
    }
  }

  return [...tags];
}
