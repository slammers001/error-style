// Core types and interfaces
export type { ErrorExplanation, PrettyTryResult } from './types/index.js';
export type { ErrorRule, RuleMatch, ErrorContext } from './rules/types.js';

// Export the main classes and functions
export { coreRules } from './rules/core-rules.js';
export { RuleEngine } from './engine/rule-engine.js';
export { PrettyFormatter, type FormatterOptions } from './formatter/pretty-formatter.js';
export { prettyTry, prettyTryAsync, formatError } from './core/index.js';
export { setupGlobalErrorHandlers, removeGlobalErrorHandlers } from './utils/global-handlers.js';
export { prettyError, logPrettyError, wrapWithErrorHandler } from './core/pretty-error.js';

// Export default instances
export { prettyFormatter } from './formatter/pretty-formatter.js';

// Export error count getter
import { PrettyFormatter } from './formatter/pretty-formatter.js';
export function getErrorCount(): number {
  return PrettyFormatter.getErrorCount();
}
