type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: Record<string, any>) {
    const formatted = this.formatMessage('info', message, context)
    console.log(formatted)
  }

  warn(message: string, context?: Record<string, any>) {
    const formatted = this.formatMessage('warn', message, context)
    console.warn(formatted)
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    }
    const formatted = this.formatMessage('error', message, errorContext)
    console.error(formatted)
  }
}

export const logger = new Logger()
