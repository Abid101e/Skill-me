import fs from 'fs';
import path from 'path';

const FRAMEWORK_MAP: Record<string, string[]> = {
  'spring-boot': ['spring', 'java'],
  'springframework': ['spring', 'java'],
  'quarkus': ['quarkus', 'java'],
  'micronaut': ['micronaut', 'java'],
  'jakarta': ['java'],
};

export function detectJava(cwd: string): string[] {
  const tags = new Set<string>();

  const hasPom = fs.existsSync(path.join(cwd, 'pom.xml'));
  const hasGradle =
    fs.existsSync(path.join(cwd, 'build.gradle')) ||
    fs.existsSync(path.join(cwd, 'build.gradle.kts'));

  if (!hasPom && !hasGradle) return [];

  tags.add('java');

  const filesToCheck = [
    path.join(cwd, 'pom.xml'),
    path.join(cwd, 'build.gradle'),
    path.join(cwd, 'build.gradle.kts'),
  ];

  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;
    try {
      const content = fs.readFileSync(file, 'utf-8').toLowerCase();
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
