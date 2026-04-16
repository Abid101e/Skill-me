import fs from 'fs';
import path from 'path';

const GEM_MAP: Record<string, string[]> = {
  rails: ['rails', 'ruby'],
  sinatra: ['sinatra', 'ruby'],
  hanami: ['hanami', 'ruby'],
  rspec: ['ruby'],
};

export function detectRuby(cwd: string): string[] {
  const tags = new Set<string>();

  const hasGemfile = fs.existsSync(path.join(cwd, 'Gemfile'));
  const hasRakefile = fs.existsSync(path.join(cwd, 'Rakefile'));

  if (!hasGemfile && !hasRakefile) return [];

  tags.add('ruby');

  if (hasGemfile) {
    try {
      const content = fs.readFileSync(path.join(cwd, 'Gemfile'), 'utf-8').toLowerCase();
      for (const [gem, detectedTags] of Object.entries(GEM_MAP)) {
        if (content.includes(`'${gem}'`) || content.includes(`"${gem}"`)) {
          detectedTags.forEach(t => tags.add(t));
        }
      }
    } catch {
      // skip unreadable
    }
  }

  return [...tags];
}
