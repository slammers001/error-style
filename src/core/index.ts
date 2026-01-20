import { ErrorExplanation, PrettyTryResult } from '../types/index.js';
import { ruleEngine } from '../engine/rule-engine.js';
import { prettyFormatter } from '../formatter/pretty-formatter.js';
import { ErrorContext } from '../rules/types.js';

// Legacy error mappings for backward compatibility
const errorMappings: Record<string, Omit<ErrorExplanation, 'message'>> = {
  'Cannot read properties of undefined': {
    reason: 'You tried to use something before it existed.',
    fix: 'Check if the value exists first using optional chaining (?.) or if statements.',
    suggestions: [
      'Try: value?.property instead of value.property',
      'Add: if (value) { /* your code */ }',
      'Initialize the variable before using it'
    ]
  },
  'Cannot read properties of null': {
    reason: 'You tried to access properties on a null value.',
    fix: 'Check if the value is null before accessing its properties.',
    suggestions: [
      'Use optional chaining: value?.property',
      'Add null check: if (value !== null)',
      'Provide a default value: value || defaultValue'
    ]
  },
  'map is not a function': {
    reason: 'You tried to call map() on something that isn\'t an array.',
    fix: 'Make sure you\'re calling map() on an actual array.',
    suggestions: [
      'Check if the value is an array: Array.isArray(value)',
      'Convert to array first: Array.from(value)',
      'Use optional chaining: value?.map(...)'
    ]
  },
  'Unexpected token': {
    reason: 'Failed to parse JSON - the response isn\'t valid JSON.',
    fix: 'The API probably returned HTML or an error message instead of JSON.',
    suggestions: [
      'Check response.status before parsing',
      'Log the raw response: console.log(await response.text())',
      'Verify the API endpoint is correct'
    ]
  },
  'Failed to fetch': {
    reason: 'Network request failed - can\'t reach the server.',
    fix: 'Check your internet connection and the API URL.',
    suggestions: [
      'Verify the URL is correct',
      'Check if the server is running',
      'Try accessing the URL in your browser'
    ]
  },
  'await is only valid in async functions': {
    reason: 'You used await outside of an async function.',
    fix: 'Add the async keyword to your function declaration.',
    suggestions: [
      'Change: function myFunc() to async function myFunc()',
      'For arrow functions: () => {} to async () => {}',
      'Use .then() instead of await if not in async function'
    ]
  },
  'module not found': {
    reason: 'The module you\'re trying to import doesn\'t exist.',
    fix: 'Install the missing package or check the import path.',
    suggestions: [
      'Run: npm install package-name',
      'Check spelling in the import statement',
      'Verify the file path is correct'
    ]
  }
};

function getErrorExplanation(error: Error): ErrorExplanation {
  const errorMessage = error.message;
  
  // Try to find exact match first
  if (errorMappings[errorMessage]) {
    return {
      message: errorMessage,
      ...errorMappings[errorMessage]
    };
  }
  
  // Try to find partial matches
  for (const [key, explanation] of Object.entries(errorMappings)) {
    if (errorMessage.includes(key)) {
      return {
        message: errorMessage,
        ...explanation
      };
    }
  }
  
  // Fallback for unknown errors
  return {
    message: errorMessage,
    reason: 'Something went wrong, but this error type isn\'t mapped yet.',
    fix: 'Check the error message and try to understand what went wrong.',
    suggestions: [
      'Look at the line number in the error',
      'Check your variable values',
      'Search online for this specific error'
    ]
  };
}

export function prettyTry<T>(fn: () => T): PrettyTryResult<T> {
  try {
    const result = fn();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: getErrorExplanation(error)
      };
    }
    
    // Handle non-Error objects
    return {
      success: false,
      error: {
        message: String(error),
        reason: 'An unknown error occurred.',
        fix: 'Check your code for potential issues.',
        suggestions: ['Add proper error handling', 'Validate your inputs']
      }
    };
  }
}

export async function prettyTryAsync<T>(fn: () => Promise<T>): Promise<PrettyTryResult<T>> {
  try {
    const result = await fn();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: getErrorExplanation(error)
      };
    }
    
    return {
      success: false,
      error: {
        message: String(error),
        reason: 'An unknown error occurred.',
        fix: 'Check your code for potential issues.',
        suggestions: ['Add proper error handling', 'Validate your inputs']
      }
    };
  }
}

export function formatError(errorExplanation: ErrorExplanation): string {
  const colors = {
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

  const maxWidth = 50;
  
  function wrapText(text: string, indent: string = ''): string[] {
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

  let output = '';
  
  // Header with error icon
  output += `\n${colors.brightRed}❌ ERROR${colors.reset}\n`;
  output += `${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
  
  // Error message (wrapped)
  const messageLines = wrapText(errorExplanation.message);
  output += `${colors.brightWhite}${messageLines.join('\n')}${colors.reset}\n\n`;
  
  // Reason section
  output += `${colors.brightBlue}🧠  REASON${colors.reset}\n`;
  const reasonLines = wrapText(errorExplanation.reason);
  output += `${colors.cyan}${reasonLines.join('\n')}${colors.reset}\n\n`;
  
  // Fix section
  output += `${colors.brightGreen}🔧  FIX${colors.reset}\n`;
  const fixLines = wrapText(errorExplanation.fix);
  output += `${colors.white}${fixLines.join('\n')}${colors.reset}\n`;
  
  // Suggestions section
  if (errorExplanation.suggestions && errorExplanation.suggestions.length > 0) {
    output += `\n${colors.brightMagenta}💡  SUGGESTIONS${colors.reset}\n`;
    errorExplanation.suggestions.forEach((suggestion, index) => {
      const bullet = index === errorExplanation.suggestions!.length - 1 ? '└──' : '├──';
      const suggestionLines = wrapText(suggestion, '    ');
      suggestionLines[0] = `  ${bullet} ${suggestionLines[0].trim()}`;
      output += `${colors.yellow}${suggestionLines.join('\n')}${colors.reset}\n`;
    });
  }
  
  output += `${colors.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`;
  
  return output;
}

export function logError(errorExplanation: ErrorExplanation): void {
  console.error(formatError(errorExplanation));
}
