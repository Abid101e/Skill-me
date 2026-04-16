import fs from 'fs';
import path from 'path';

const PACKAGE_MAP: Record<string, string[]> = {
  fastapi:  ['fastapi', 'python'],
  django:   ['django', 'python'],
  flask:    ['flask', 'python'],
  starlette:['fastapi', 'python'],
};

export function detectPython(cwd: string): string[] {
  const tags = new Set<string>();

  const files = ['requirements.txt', 'requirements-dev.txt', 'pyproject.toml', 'Pipfile'];
  const found = files.some(f => fs.existsSync(path.join(cwd, f)));
  if (!found) return [];

  tags.add('python');

  for (const file of files) {
    const filePath = path.join(cwd, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
    for (const [pkg, detectedTags] of Object.entries(PACKAGE_MAP)) {
      if (content.includes(pkg)) {
        detectedTags.forEach(t => tags.add(t));
      }
    }
  }

  return [...tags];
}
