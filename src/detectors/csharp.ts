import fs from 'fs';
import path from 'path';

const FRAMEWORK_MAP: Record<string, string[]> = {
  'microsoft.aspnetcore': ['aspnet', 'csharp'],
  'microsoft.entityframeworkcore': ['efcore', 'csharp'],
  'blazor': ['blazor', 'csharp'],
  'maui': ['maui', 'csharp'],
};

export function detectCSharp(cwd: string): string[] {
  const tags = new Set<string>();

  // Detect by project files
  const hasCsproj = fs.readdirSync(cwd).some(f => f.endsWith('.csproj'));
  const hasSln = fs.readdirSync(cwd).some(f => f.endsWith('.sln'));
  const hasGlobalJson = fs.existsSync(path.join(cwd, 'global.json'));

  if (!hasCsproj && !hasSln && !hasGlobalJson) return [];

  tags.add('csharp');

  // Parse .csproj for framework references
  const csprojFiles = fs.readdirSync(cwd).filter(f => f.endsWith('.csproj'));
  for (const file of csprojFiles) {
    try {
      const content = fs.readFileSync(path.join(cwd, file), 'utf-8').toLowerCase();
      for (const [pkg, detectedTags] of Object.entries(FRAMEWORK_MAP)) {
        if (content.includes(pkg)) {
          detectedTags.forEach(t => tags.add(t));
        }
      }
    } catch {
      // skip unreadable files
    }
  }

  return [...tags];
}
