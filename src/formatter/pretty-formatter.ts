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
    
    let output = '';
    
    // Header with severity icon
    const severityIcon = this.getSeverityIcon(rule.severity);
    output += `\n${colors.brightRed}${severityIcon} ${rule.title.toUpperCase()}${colors.reset}\n`;
    output += `${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
    
    // Quick explanation
    output += `${colors.cyan}${rule.explanation}${colors.reset}\n\n`;
    
    // Quick fixes (max 3)
    output += `${colors.brightGreen}🔧 QUICK FIX:${colors.reset}\n`;
    const fixesToShow = rule.fixes.slice(0, 3);
    fixesToShow.forEach((fix, index) => {
      const bullet = index === fixesToShow.length - 1 ? '└──' : '├──';
      output += `${colors.white}  ${bullet} ${fix}${colors.reset}\n`;
    });
    
    // Show what to look at
    output += `\n${colors.brightYellow}👀 LOOK AT:${colors.reset}\n`;
    
    // Extract actual file and line from stack trace
    const stackInfo = this.extractStackInfo(error.stack);
    if (stackInfo.file) {
      output += `${colors.yellow}  • File: ${stackInfo.file}${colors.reset}\n`;
    }
    if (stackInfo.line) {
      output += `${colors.yellow}  • Line: ${stackInfo.line}${colors.reset}\n`;
    }
    
    // Extract variable name from error message
    const variableName = this.extractVariableName(error.message);
    if (variableName) {
      output += `${colors.yellow}  • Variable: "${variableName}"${colors.reset}\n`;
    }
    
    return output;
  }

  /**
   * Format error when no rule matches
   */
  private formatUnknownError(error: Error, context?: ErrorContext): string {
    const colors = this.getColors();
    
    let output = '';
    
    output += `\n${colors.brightRed}❌ UNKNOWN ERROR${colors.reset}\n`;
    output += `${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
    
    output += `${colors.brightWhite}${error.message}${colors.reset}\n\n`;
    
    output += `${colors.brightBlue}🧠 WHAT HAPPENED${colors.reset}\n`;
    output += `${colors.cyan}This error type isn't in our database yet.${colors.reset}\n\n`;
    
    output += `${colors.brightGreen}🔧 QUICK FIX:${colors.reset}\n`;
    output += `${colors.white}  ├── Look at line number${colors.reset}\n`;
    output += `${colors.white}  ├── Check variable values${colors.reset}\n`;
    output += `${colors.white}  └── Search online for error${colors.reset}\n`;
    
    // Show what to look at
    output += `\n${colors.brightYellow}👀 LOOK AT:${colors.reset}\n`;
    
    // Extract actual file and line from stack trace
    const stackInfo = this.extractStackInfo(error.stack);
    if (stackInfo.file) {
      output += `${colors.yellow}  • File: ${stackInfo.file}${colors.reset}\n`;
    }
    if (stackInfo.line) {
      output += `${colors.yellow}  • Line: ${stackInfo.line}${colors.reset}\n`;
    }
    
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
   * Extract file and line info from stack trace
   */
  private extractStackInfo(stack?: string): { file?: string; line?: string } {
    if (!stack) return {};
    
    const lines = stack.split('\n');
    for (const line of lines) {
      // Match file:// paths without parentheses (ES modules)
      const fileMatch = line.match(/at .+ \(file:\/\/(.+):(\d+):(\d+)\)/);
      if (fileMatch) {
        return { file: fileMatch[1], line: fileMatch[2] };
      }
      
      // Match file:// paths without parentheses
      const directFileMatch = line.match(/at file:\/\/(.+):(\d+):(\d+)/);
      if (directFileMatch) {
        return { file: directFileMatch[1], line: directFileMatch[2] };
      }
      
      // Match regular file paths with parentheses
      const pathMatch = line.match(/at .+ \(([^)]+):(\d+):(\d+)\)/);
      if (pathMatch) {
        const file = pathMatch[1];
        // Skip node internal files
        if (!file.includes('node:') && !file.includes('internal/')) {
          return { file, line: pathMatch[2] };
        }
      }
    }
    return {};
  }

  /**
   * Extract variable name from error message
   */
  private extractVariableName(message: string): string | null {
    // Match patterns like "Cannot read properties of undefined (reading 'map')"
    const match = message.match(/Cannot read properties of (undefined|null) \(reading '([^']+)'\)/);
    if (match) return match[1];
    
    // Match patterns like "map is not a function"
    const funcMatch = message.match(/(\w+) is not a function/);
    if (funcMatch) return funcMatch[1];
    
    return null;
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
