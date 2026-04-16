import fs from 'fs';
import path from 'path';

export function detectRust(cwd: string): string[] {
  if (!fs.existsSync(path.join(cwd, 'Cargo.toml'))) return [];
  return ['rust'];
}
