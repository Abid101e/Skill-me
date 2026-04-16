import fs from 'fs';
import path from 'path';

export function detectGo(cwd: string): string[] {
  if (!fs.existsSync(path.join(cwd, 'go.mod'))) return [];
  return ['go'];
}
