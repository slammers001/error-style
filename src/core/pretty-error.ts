import { ruleEngine } from '../engine/rule-engine.js';
import { prettyFormatter } from '../formatter/pretty-formatter.js';
import { ErrorContext } from '../rules/types.js';

/**
 * Main enhanced error handler - the primary way to use error-style
 */
export function prettyError(error: Error, context?: Partial<ErrorContext>): string {
  const ruleMatch = ruleEngine.findMatch(error, context);
  return prettyFormatter.formatError(error, ruleMatch, context);
}

/**
 * Log an error with pretty formatting
 */
export function logPrettyError(error: Error, context?: Partial<ErrorContext>): void {
  console.error(prettyError(error, context));
}

/**
 * Create a wrapped function that automatically handles errors
 */
export function wrapWithErrorHandler<T extends (...args: any[]) => any>(
  fn: T,
  context?: Partial<ErrorContext>
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.catch === 'function') {
        return result.catch((error: Error) => {
          logPrettyError(error, context);
          throw error; // Re-throw to maintain behavior
        });
      }
      
      return result;
    } catch (error) {
      logPrettyError(error instanceof Error ? error : new Error(String(error)), context);
      throw error; // Re-throw to maintain behavior
    }
  }) as T;
}
