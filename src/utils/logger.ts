type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const prefix = '[form-auto-input]';

const fmt = (level: LogLevel, msg: string, ...args: unknown[]) => {
  const ts = new Date().toISOString();
  return [`${prefix} ${ts} ${level.toUpperCase()}: ${msg}`, ...args] as const;
};

export const log = {
  debug: (msg: string, ...args: unknown[]) => console.debug(...fmt('debug', msg, ...args)),
  info: (msg: string, ...args: unknown[]) => console.info(...fmt('info', msg, ...args)),
  warn: (msg: string, ...args: unknown[]) => console.warn(...fmt('warn', msg, ...args)),
  error: (msg: string, ...args: unknown[]) => console.error(...fmt('error', msg, ...args)),
};


