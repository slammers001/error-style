import { ruleEngine } from '../engine/rule-engine.js';
import { prettyFormatter } from '../formatter/pretty-formatter.js';
import { ErrorContext } from '../rules/types.js';

/**
 * Set up global error handlers to catch all unhandled errors
 */
export function setupGlobalErrorHandlers(context?: Partial<ErrorContext>) {
  // Node.js environment
  if (typeof process !== 'undefined' && process.on) {
    // Catch uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      const ruleMatch = ruleEngine.findMatch(error, context);
      const formatted = prettyFormatter.formatError(error, ruleMatch, context);
      console.error(formatted);
      
      // Exit process after logging
      process.exit(1);
    });

    // Catch unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      const ruleMatch = ruleEngine.findMatch(error, context);
      const formatted = prettyFormatter.formatError(error, ruleMatch, context);
      console.error(formatted);
    });
  }

  // Browser environment
  if (typeof window !== 'undefined') {
    // Catch JavaScript errors
    window.onerror = (message, source, line, column, error) => {
      if (error) {
        const ruleMatch = ruleEngine.findMatch(error, {
          ...context,
          line,
          column,
          code: source
        });
        const formatted = prettyFormatter.formatError(error, ruleMatch, {
          ...context,
          line,
          column,
          code: source
        });
        console.error(formatted);
      }
      return false; // Let default handler run
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      const ruleMatch = ruleEngine.findMatch(error, context);
      const formatted = prettyFormatter.formatError(error, ruleMatch, context);
      console.error(formatted);
    };
  }
}

/**
 * Remove global error handlers
 */
export function removeGlobalErrorHandlers() {
  if (typeof process !== 'undefined' && process.removeAllListeners) {
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
  }

  if (typeof window !== 'undefined') {
    window.onerror = null;
    window.onunhandledrejection = null;
  }
}
