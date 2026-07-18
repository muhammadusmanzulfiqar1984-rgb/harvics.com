/**
 * hxLogger — structured JSON logger for HarvyX Data Bank
 * Rules:
 *   - JSON to stdout only, never console.log
 *   - debug is suppressed in production (NODE_ENV === 'production')
 *   - All output includes timestamp + level + module
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  ts: string;
  level: LogLevel;
  module: string;
  msg: string;
  data?: unknown;
  err?: string;
  stack?: string;
}

const IS_PROD = process.env.NODE_ENV === 'production';

function emit(entry: LogEntry): void {
  process.stdout.write(JSON.stringify(entry) + '\n');
}

function buildEntry(
  level: LogLevel,
  module: string,
  msg: string,
  meta?: unknown,
): LogEntry {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    module,
    msg,
  };

  if (meta instanceof Error) {
    entry.err = meta.message;
    entry.stack = meta.stack;
  } else if (meta !== undefined) {
    entry.data = meta;
  }

  return entry;
}

export const hxLogger = {
  info(module: string, msg: string, meta?: unknown): void {
    emit(buildEntry('INFO', module, msg, meta));
  },

  warn(module: string, msg: string, meta?: unknown): void {
    emit(buildEntry('WARN', module, msg, meta));
  },

  error(module: string, msg: string, meta?: unknown): void {
    emit(buildEntry('ERROR', module, msg, meta));
  },

  debug(module: string, msg: string, meta?: unknown): void {
    if (IS_PROD) return;
    emit(buildEntry('DEBUG', module, msg, meta));
  },
};
