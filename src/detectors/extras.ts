import fs from 'fs';
import path from 'path';

export function detectExtras(cwd: string): string[] {
  const tags: string[] = [];

  if (fs.existsSync(path.join(cwd, '.github', 'workflows'))) {
    tags.push('github-ci');
  }

  if (
    fs.existsSync(path.join(cwd, 'Dockerfile')) ||
    fs.existsSync(path.join(cwd, 'docker-compose.yml')) ||
    fs.existsSync(path.join(cwd, 'docker-compose.yaml'))
  ) {
    tags.push('docker');
  }

  return tags;
}
