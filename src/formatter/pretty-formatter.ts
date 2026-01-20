import { ErrorRule, RuleMatch, ErrorContext } from '../rules/types.js';
import { formatError } from '../index.js';

export interface FormatterOptions {
  showOriginalError?: boolean;
  showStack?: boolean;
  showContext?: boolean;
  maxWidth?: number;
  useColors?: boolean;
  showSeverity?: boolean;
  showExamples?: boolean;
}

export class PrettyFormatter {
  private options: FormatterOptions;
  
  constructor(options: FormatterOptions = {}) {
    this.options = {
      showOriginalError: true,
      showStack: true,
      showContext: true,
      maxWidth: 60,
      useColors: true,
      showSeverity: true,
      showExamples: false,
      ...options
    };
  }

  /**
   * Format an error with rule matching
   */
  formatError(error: Error, ruleMatch: RuleMatch | null, context?: ErrorContext): string {
    if (!ruleMatch) {
      return this.formatUnknownError(error, context);
    }

    return this.formatKnownError(error, ruleMatch, context);
  }

  /**
   * Format error when we have a matching rule
   */
  private formatKnownError(error: Error, ruleMatch: RuleMatch, context?: ErrorContext): string {
    const { rule } = ruleMatch;
    const colors = this.getColors();
    const maxWidth = this.options.maxWidth || 60;
    
    let output = '';
    
    // Header with severity indicator
    const severityIcon = this.getSeverityIcon(rule.severity);
    output += `\n${colors.brightRed}${severityIcon} ${rule.title.toUpperCase()}${colors.reset}\n`;
    output += `${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
    
    // Error message
    output += `${colors.brightWhite}${this.wrapText(error.message, '', maxWidth).join('\n')}${colors.reset}\n\n`;
    
    // Explanation
    output += `${colors.brightBlue}🧠  WHAT HAPPENED${colors.reset}\n`;
    output += `${colors.cyan}${this.wrapText(rule.explanation, '', maxWidth).join('\n')}${colors.reset}\n\n`;
    
    // Fixes
    output += `${colors.brightGreen}🔧  HOW TO FIX${colors.reset}\n`;
    rule.fixes.forEach((fix, index) => {
      const bullet = index === rule.fixes.length - 1 ? '└──' : '├──';
      const fixLines = this.wrapText(fix, '    ', maxWidth);
      fixLines[0] = `  ${bullet} ${fixLines[0].trim()}`;
      output += `${colors.white}${fixLines.join('\n')}${colors.reset}\n`;
    });
    
    // Examples (if enabled)
    if (this.options.showExamples && rule.examples) {
      output += `\n${colors.brightMagenta}💡  EXAMPLES${colors.reset}\n`;
      rule.examples.forEach(example => {
        output += `${colors.yellow}  • ${example}${colors.reset}\n`;
      });
    }
    
    // Context information
    if (this.options.showContext && context) {
      output += `\n${colors.brightCyan}📍  CONTEXT${colors.reset}\n`;
      if (context.framework) output += `${colors.cyan}  Framework: ${context.framework}${colors.reset}\n`;
      if (context.environment) output += `${colors.cyan}  Environment: ${context.environment}${colors.reset}\n`;
      if (context.line) output += `${colors.cyan}  Line: ${context.line}${colors.reset}\n`;
    }
    
    // Severity and confidence
    if (this.options.showSeverity) {
      output += `\n${colors.dim}  Severity: ${rule.severity || 'unknown'} | Confidence: ${Math.round(ruleMatch.confidence * 100)}%${colors.reset}\n`;
    }
    
    // Original error (if enabled)
    if (this.options.showOriginalError) {
      output += `\n${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
      output += `${colors.dim}ORIGINAL ERROR:${colors.reset}\n`;
      output += `${colors.white}${error.name}: ${error.message}${colors.reset}\n`;
      
      if (this.options.showStack && error.stack) {
        output += `\n${colors.dim}STACK TRACE:${colors.reset}\n`;
        output += `${colors.dim}${this.formatStack(error.stack, maxWidth)}${colors.reset}\n`;
      }
    }
    
    output += `${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
    
    return output;
  }

  /**
   * Format error when no rule matches
   */
  private formatUnknownError(error: Error, context?: ErrorContext): string {
    const colors = this.getColors();
    const maxWidth = this.options.maxWidth || 60;
    
    let output = '';
    
    output += `\n${colors.brightRed}❌ UNKNOWN ERROR${colors.reset}\n`;
    output += `${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
    
    output += `${colors.brightWhite}${this.wrapText(error.message, '', maxWidth).join('\n')}${colors.reset}\n\n`;
    
    output += `${colors.brightBlue}🧠  WHAT HAPPENED${colors.reset}\n`;
    output += `${colors.cyan}${this.wrapText('This error type isn\'t in our database yet. Check the error message and try to understand what went wrong.', '', maxWidth).join('\n')}${colors.reset}\n\n`;
    
    output += `${colors.brightGreen}🔧  HOW TO FIX${colors.reset}\n`;
    const genericFixes = [
      'Look at the line number in the error message',
      'Check your variable values with console.log',
      'Search online for this specific error message',
      'Make sure all imports and dependencies are correct'
    ];
    
    genericFixes.forEach((fix, index) => {
      const bullet = index === genericFixes.length - 1 ? '└──' : '├──';
      output += `${colors.white}  ${bullet} ${fix}${colors.reset}\n`;
    });
    
    if (this.options.showOriginalError && error.stack) {
      output += `\n${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
      output += `${colors.dim}FULL ERROR:${colors.reset}\n`;
      output += `${colors.white}${error.stack}${colors.reset}\n`;
    }
    
    output += `${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
    
    return output;
  }

  /**
   * Get color scheme
   */
  private getColors() {
    if (!this.options.useColors) {
      return {
        reset: '',
        brightRed: '',
        brightYellow: '',
        brightBlue: '',
        brightGreen: '',
        brightMagenta: '',
        brightCyan: '',
        brightWhite: '',
        cyan: '',
        white: '',
        yellow: '',
        dim: ''
      };
    }
    
    return {
      reset: '\x1b[0m',
      brightRed: '\x1b[91m',
      brightYellow: '\x1b[93m',
      brightBlue: '\x1b[94m',
      brightGreen: '\x1b[92m',
      brightMagenta: '\x1b[95m',
      brightCyan: '\x1b[96m',
      brightWhite: '\x1b[97m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      yellow: '\x1b[33m',
      dim: '\x1b[2m'
    };
  }

  /**
   * Get severity icon
   */
  private getSeverityIcon(severity?: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '❌';
    }
  }

  /**
   * Wrap text to fit within maxWidth
   */
  private wrapText(text: string, indent: string = '', maxWidth: number = 60): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxWidth - indent.length) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(indent + currentLine);
        }
        currentLine = word;
      }
    });
    
    if (currentLine) {
      lines.push(indent + currentLine);
    }
    
    return lines.length > 0 ? lines : [indent + text];
  }

  /**
   * Format stack trace for better readability
   */
  private formatStack(stack: string, maxWidth: number): string {
    const lines = stack.split('\n');
    const formatted = lines.slice(0, 5).map(line => {
      // Highlight the file path and line number
      const match = line.match(/at .+ \((.+):(\d+):(\d+)\)/);
      if (match) {
        const [, file, lineNum, col] = match;
        return `  at ${file}:${lineNum}:${col}`;
      }
      return `  ${line}`;
    });
    
    if (lines.length > 5) {
      formatted.push(`  ... and ${lines.length - 5} more lines`);
    }
    
    return formatted.join('\n');
  }
}

// Default formatter instance
export const prettyFormatter = new PrettyFormatter();
