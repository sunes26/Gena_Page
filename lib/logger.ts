// lib/logger.ts
/**
 * Production-ready Logger with Pino
 *
 * 로그 레벨:
 * - trace (10): 매우 상세한 디버깅
 * - debug (20): 디버깅 정보
 * - info (30): 일반 정보
 * - warn (40): 경고
 * - error (50): 에러
 * - fatal (60): 치명적 에러
 *
 * 환경별 설정:
 * - Development: pretty print, debug 레벨
 * - Production: JSON format, warn 레벨
 */

// ✅ 브라우저 환경 체크
const isBrowser = typeof window !== 'undefined';

// 타입 정의
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

// Sentry 타입 정의
interface SentryWindow extends Window {
  Sentry?: {
    captureException: (error: Error, context?: unknown) => void;
    captureMessage: (message: string, context?: unknown) => void;
  };
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

// Logger 선언 (조건부 할당)
let logger: unknown;
let createLogger: (context: LogContext | Record<string, unknown>) => unknown;
let authLogger: unknown;
let apiLogger: unknown;
let paddleLogger: unknown;
let firebaseLogger: unknown;

// 브라우저 환경에서는 간단한 로거 사용
if (isBrowser) {
  // 브라우저용 로거
  class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';
    private isProduction = process.env.NODE_ENV === 'production';

    /**
     * Internal log function
     */
    private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
        error,
      };

      // Development: Pretty console output
      if (this.isDevelopment) {
        this.consoleLog(entry);
      }

      // Production: Send to Sentry
      if (this.isProduction && typeof window !== 'undefined' && (window as SentryWindow).Sentry) {
        this.sendToSentry(entry);
      }
    }

    /**
     * Pretty console output for development
     */
    private consoleLog(entry: LogEntry) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      };

      const color = {
        debug: 'color: #888',
        info: 'color: #0066cc',
        warn: 'color: #ff9800',
        error: 'color: #f44336',
      };

      console.log(
        `%c${emoji[entry.level]} [${entry.level.toUpperCase()}] ${entry.message}`,
        color[entry.level]
      );

      if (entry.context && Object.keys(entry.context).length > 0) {
        console.log('  Context:', entry.context);
      }

      if (entry.error) {
        console.error('  Error:', entry.error);
      }
    }

    /**
     * Send logs to Sentry
     */
    private sendToSentry(entry: LogEntry) {
      const Sentry = (window as SentryWindow).Sentry;
      if (!Sentry) return;

      if (entry.level === 'error' && entry.error) {
        Sentry.captureException(entry.error, {
          level: 'error',
          extra: entry.context,
          tags: { source: 'browser' },
        });
      } else if (entry.level === 'warn' || entry.level === 'error') {
        Sentry.captureMessage(entry.message, {
          level: entry.level,
          extra: entry.context,
          tags: { source: 'browser' },
        });
      }
    }

    /**
     * Create a child logger with default context
     */
    child(defaultContext: LogContext): Logger {
      const childLogger = new Logger();
      const originalLog = childLogger['log'].bind(childLogger) as (
        level: LogLevel,
        message: string,
        context?: LogContext,
        error?: Error
      ) => void;

      childLogger['log'] = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
        const mergedContext = { ...defaultContext, ...context };
        originalLog(level, message, mergedContext, error);
      };

      return childLogger;
    }

    debug(message: string, context?: LogContext) {
      this.log('debug', message, context);
    }

    info(message: string, context?: LogContext) {
      this.log('info', message, context);
    }

    warn(message: string, context?: LogContext) {
      this.log('warn', message, context);
    }

    error(message: string, contextOrError?: LogContext | Error, error?: Error) {
      if (contextOrError instanceof Error) {
        this.log('error', message, undefined, contextOrError);
      } else {
        this.log('error', message, contextOrError, error);
      }
    }
  }

  // Export singleton instance
  logger = new Logger();
  createLogger = (context: LogContext) => (logger as Logger).child(context);

  // Convenience exports for common use cases
  authLogger = createLogger({ module: 'auth' });
  apiLogger = createLogger({ module: 'api' });
  paddleLogger = createLogger({ module: 'paddle' });
  firebaseLogger = createLogger({ module: 'firebase' });

} else {
  // 서버 환경: Pino 사용
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pino = require('pino');

  const isDevelopment = process.env.NODE_ENV === 'development';
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'warn');

  // Pino 기본 설정
  const pinoLogger = pino({
    level: logLevel,

    // 기본 필드 추가
    base: {
      env: process.env.NODE_ENV,
      revision: process.env.VERCEL_GIT_COMMIT_SHA,
    },

    // 타임스탬프 포맷
    timestamp: () => `,"time":"${new Date().toISOString()}"`,

    // Pretty print for development
    transport: isDevelopment ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    } : undefined,

    // 에러 직렬화 개선
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },

    // 포맷터
    formatters: {
      level: (label: string) => {
        return { level: label.toUpperCase() };
      },
    },

    // 프로덕션에서 민감한 정보 자동 제거
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'token',
        'apiKey',
        'secret',
        '*.password',
        '*.token',
        '*.apiKey',
        '*.secret',
      ],
      remove: true,
    },
  });

  // Pino logger export
  logger = pinoLogger;

  /**
   * 자식 로거 생성 (컨텍스트 추가)
   */
  createLogger = (context: Record<string, unknown>) => {
    return pinoLogger.child(context);
  };

  // Convenience exports for common use cases
  authLogger = createLogger({ module: 'auth' });
  apiLogger = createLogger({ module: 'api' });
  paddleLogger = createLogger({ module: 'paddle' });
  firebaseLogger = createLogger({ module: 'firebase' });
}

// Export
export { logger, createLogger, authLogger, apiLogger, paddleLogger, firebaseLogger };
export default logger;
