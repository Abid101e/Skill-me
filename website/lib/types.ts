export interface Plugin {
  name: string;
  marketplace: string;
  description: string;
  tags: string[];
  trusted: boolean;
  requiresBinary?: string;
}

export interface Marketplace {
  id: string;
  repo: string;
  trusted: boolean;
  description: string;
}

export interface IndexData {
  version: string;
  indexUrl: string;
  cacheTtlMinutes: number;
  marketplaces: Marketplace[];
  plugins: Record<string, Omit<Plugin, 'name'>>;
  recommendations: Record<string, string[]>;
  featured?: string[];
}
