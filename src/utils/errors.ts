export class SkillmeError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'SkillmeError';
  }
}

export class ClaudeNotFoundError extends SkillmeError {
  constructor() {
    super(
      'Claude Code CLI not found in PATH.\n  Install it from https://claude.ai/code then try again.',
      'CLAUDE_NOT_FOUND'
    );
    this.name = 'ClaudeNotFoundError';
  }
}

export class InvalidInputError extends SkillmeError {
  constructor(field: string, value: string, hint?: string) {
    super(
      `Invalid ${field}: "${value}"${hint ? `\n  ${hint}` : ''}`,
      'INVALID_INPUT'
    );
    this.name = 'InvalidInputError';
  }
}

export class MarketplaceFetchError extends SkillmeError {
  constructor(source: string, cause?: string) {
    super(
      `Failed to fetch from marketplace "${source}"${cause ? `: ${cause}` : '.'}`,
      'MARKETPLACE_FETCH_ERROR'
    );
    this.name = 'MarketplaceFetchError';
  }
}

export class InstallError extends SkillmeError {
  constructor(plugin: string, cause?: string) {
    super(
      `Failed to install "${plugin}"${cause ? `: ${cause}` : '.'}`,
      'INSTALL_ERROR'
    );
    this.name = 'InstallError';
  }
}

export class PluginNotFoundError extends SkillmeError {
  constructor(name: string) {
    super(
      `Plugin "${name}" not found in any marketplace.\n  Run: skillme search ${name}`,
      'PLUGIN_NOT_FOUND'
    );
    this.name = 'PluginNotFoundError';
  }
}
