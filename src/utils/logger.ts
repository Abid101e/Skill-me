import pc from 'picocolors';

// enable debug output with: DEBUG=skillme skillme <command>
const DEBUG = process.env['DEBUG']?.includes('skillme') ?? false;

const PREFIX = {
  debug: pc.dim('[debug]'),
  info:  pc.cyan('[info] '),
  warn:  pc.yellow('[warn] '),
  error: pc.red('[error]'),
};

export const logger = {
  debug: (msg: string, ...args: unknown[]) => {
    if (!DEBUG) return;
    console.debug(`${PREFIX.debug} ${msg}`, ...args);
  },

  info: (msg: string, ...args: unknown[]) => {
    console.log(`${PREFIX.info} ${msg}`, ...args);
  },

  warn: (msg: string, ...args: unknown[]) => {
    console.warn(`${PREFIX.warn} ${msg}`, ...args);
  },

  error: (msg: string, err?: unknown) => {
    console.error(`${PREFIX.error} ${msg}`);
    if (DEBUG && err instanceof Error) {
      console.error(pc.dim(err.stack ?? err.message));
    }
  },
};
