import pc from 'picocolors';
import { detectNode } from './node.js';
import { detectPython } from './python.js';
import { detectGo } from './go.js';
import { detectRust } from './rust.js';
import { detectExtras } from './extras.js';
import { detectCSharp } from './csharp.js';
import { detectJava } from './java.js';
import { detectRuby } from './ruby.js';
import { detectPHP } from './php.js';
import { detectDart } from './dart.js';
import { detectReadme } from './readme.js';

export interface DetectedStack {
  tags: string[];
  display: string[];
}

const DISPLAY_NAMES: Record<string, string> = {
  // JavaScript / Node
  nextjs:      'Next.js',
  react:       'React',
  vue:         'Vue',
  nuxt:        'Nuxt',
  svelte:      'Svelte',
  typescript:  'TypeScript',
  node:        'Node.js',
  express:     'Express',
  fastify:     'Fastify',
  nestjs:      'NestJS',
  prisma:      'Prisma',
  // Python
  python:      'Python',
  fastapi:     'FastAPI',
  django:      'Django',
  flask:       'Flask',
  // Go
  go:          'Go',
  gin:         'Gin (Go)',
  echo:        'Echo (Go)',
  fiber:       'Fiber (Go)',
  // Rust
  rust:        'Rust',
  actix:       'Actix (Rust)',
  axum:        'Axum (Rust)',
  rocket:      'Rocket (Rust)',
  // C#
  csharp:      'C# / .NET',
  aspnet:      'ASP.NET Core',
  blazor:      'Blazor',
  // Java
  java:        'Java',
  spring:      'Spring Boot',
  quarkus:     'Quarkus',
  // Ruby
  ruby:        'Ruby',
  rails:       'Ruby on Rails',
  // PHP
  php:         'PHP',
  laravel:     'Laravel',
  symfony:     'Symfony',
  // Dart / Flutter
  dart:        'Dart',
  flutter:     'Flutter',
  // DevOps / Infra
  docker:      'Docker',
  'github-ci': 'GitHub Actions',
};

export function detectStack(cwd: string): DetectedStack {
  // Run all file-based detectors first
  const fileTags = new Set<string>([
    ...detectNode(cwd),
    ...detectPython(cwd),
    ...detectGo(cwd),
    ...detectRust(cwd),
    ...detectCSharp(cwd),
    ...detectJava(cwd),
    ...detectRuby(cwd),
    ...detectPHP(cwd),
    ...detectDart(cwd),
    ...detectExtras(cwd),
  ]);

  // README fills in any gaps not already found by file detectors
  const readmeTags = detectReadme(cwd, fileTags);

  const allTags = new Set<string>([...fileTags, ...readmeTags]);
  const tags = [...allTags];

  const display = tags
    .filter(t => DISPLAY_NAMES[t])
    .map(t => {
      const isFromReadme = !fileTags.has(t) && readmeTags.includes(t);
      return isFromReadme
        ? `${DISPLAY_NAMES[t]} ${dimSource('README')}`
        : DISPLAY_NAMES[t];
    });

  return { tags, display };
}

function dimSource(label: string): string {
  return pc.dim(`(from ${label})`);
}
