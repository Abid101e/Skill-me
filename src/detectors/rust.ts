import fs from 'fs';
import path from 'path';

const CRATE_MAP: Record<string, string[]> = {
  'actix-web':  ['actix', 'rust'],
  'axum':       ['axum', 'rust'],
  'rocket':     ['rocket', 'rust'],
  'warp':       ['rust'],
  'tokio':      ['rust'],
  'serde':      ['rust'],
  'sqlx':       ['rust'],
  'diesel':     ['rust'],
};

export function detectRust(cwd: string): string[] {
  const cargoPath = path.join(cwd, 'Cargo.toml');
  if (!fs.existsSync(cargoPath)) return [];

  const tags = new Set<string>(['rust']);

  try {
    const content = fs.readFileSync(cargoPath, 'utf-8').toLowerCase();
    for (const [crate, detectedTags] of Object.entries(CRATE_MAP)) {
      if (content.includes(crate)) {
        detectedTags.forEach(t => tags.add(t));
      }
    }
  } catch {
    // Cargo.toml unreadable — still return 'rust'
  }

  return [...tags];
}
