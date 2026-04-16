import fs from 'fs';
import path from 'path';

const MODULE_MAP: Record<string, string[]> = {
  'github.com/gin-gonic/gin':    ['gin', 'go'],
  'github.com/labstack/echo':    ['echo', 'go'],
  'github.com/gofiber/fiber':    ['fiber', 'go'],
  'github.com/gorilla/mux':      ['go'],
  'github.com/go-chi/chi':       ['go'],
  'gorm.io/gorm':                ['go'],
  'github.com/grpc-ecosystem':   ['go'],
};

export function detectGo(cwd: string): string[] {
  const goModPath = path.join(cwd, 'go.mod');
  if (!fs.existsSync(goModPath)) return [];

  const tags = new Set<string>(['go']);

  try {
    const content = fs.readFileSync(goModPath, 'utf-8');
    for (const [mod, detectedTags] of Object.entries(MODULE_MAP)) {
      if (content.includes(mod)) {
        detectedTags.forEach(t => tags.add(t));
      }
    }
  } catch {
    // go.mod unreadable — still return 'go'
  }

  return [...tags];
}
