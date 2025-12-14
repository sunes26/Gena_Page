/**
 * Structured Logging System
 *
 * 구조화된 로깅 시스템으로 console.log를 대체합니다.
 * 프로덕션에서는 외부 로깅 서비스(Sentry, Datadog 등)로 전송할 수 있습니다.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Debug level logging (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorObj = error instanceof Error ? error : undefined;
    this.log('error', message, context, errorObj);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
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

    // Production: Send to external service (Sentry, Datadog, etc.)
    if (this.isProduction) {
      this.sendToExternalService(entry);
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
    }[entry.level];

    const color = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[34m',  // Blue
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    }[entry.level];

    const reset = '\x1b[0m';

    // Format: [TIME] EMOJI [LEVEL] Message
    const prefix = `${color}[${entry.level.toUpperCase()}]${reset} ${emoji}`;

    console.log(`${prefix} ${entry.message}`);

    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log('  Context:', entry.context);
    }

    if (entry.error) {
      console.error('  Error:', entry.error);
    }
  }

  /**
   * Send logs to external service
   * TODO: Integrate with Sentry, Datadog, or other logging service
   */
  private sendToExternalService(entry: LogEntry) {
    // In production, send to external logging service
    // For now, we'll just use console.error for errors
    if (entry.level === 'error') {
      console.error('[Logger]', entry.message, entry.error);
    }

    // TODO: Integrate with Sentry
    // if (window.Sentry) {
    //   Sentry.captureException(entry.error || new Error(entry.message), {
    //     level: entry.level,
    //     extra: entry.context,
    //   });
    // }
  }

  /**
   * Create a child logger with default context
   * Useful for adding consistent context to all logs in a module
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);

    childLogger.log = (level, message, context?, error?) => {
      const mergedContext = { ...defaultContext, ...context };
      originalLog(level, message, mergedContext, error);
    };

    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export child logger factory
export const createLogger = (context: LogContext) => logger.child(context);

// Convenience exports for common use cases
export const authLogger = createLogger({ module: 'auth' });
export const apiLogger = createLogger({ module: 'api' });
export const paddleLogger = createLogger({ module: 'paddle' });
export const firebaseLogger = createLogger({ module: 'firebase' });
