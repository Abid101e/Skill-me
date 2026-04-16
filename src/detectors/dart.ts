import fs from 'fs';
import path from 'path';

const DEP_MAP: Record<string, string[]> = {
  flutter:         ['flutter', 'dart'],
  'flutter_bloc':  ['flutter', 'dart'],
  'provider':      ['flutter', 'dart'],
  'riverpod':      ['flutter', 'dart'],
  'get':           ['flutter', 'dart'],
  'dio':           ['dart'],
  'shelf':         ['dart'],
};

export function detectDart(cwd: string): string[] {
  const pubspecPath = path.join(cwd, 'pubspec.yaml');
  if (!fs.existsSync(pubspecPath)) return [];

  const tags = new Set<string>(['dart']);

  try {
    const content = fs.readFileSync(pubspecPath, 'utf-8').toLowerCase();

    // Check for flutter SDK dependency
    if (content.includes('sdk: flutter') || content.includes("sdk: 'flutter'")) {
      tags.add('flutter');
    }

    for (const [dep, detectedTags] of Object.entries(DEP_MAP)) {
      if (content.includes(dep + ':') || content.includes(dep + ' ')) {
        detectedTags.forEach(t => tags.add(t));
      }
    }
  } catch {
    // pubspec.yaml unreadable — still return 'dart'
  }

  return [...tags];
}
