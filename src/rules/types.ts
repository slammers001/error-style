export interface ErrorRule {
  id: string;
  name: string;
  category: 'javascript' | 'nodejs' | 'react' | 'network' | 'async' | 'json';
  
  // Pattern matching
  match: (error: Error) => boolean;
  
  // Human-friendly explanation
  title: string;
  explanation: string;
  
  // Actionable fixes
  fixes: string[];
  
  // Additional context
  examples?: string[];
  relatedErrors?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  
  // Framework-specific context
  frameworks?: string[];
  
  // Learning resources
  resources?: {
    title: string;
    url: string;
  }[];
}

export interface RuleMatch {
  rule: ErrorRule;
  error: Error;
  confidence: number; // 0-1, how confident we are this is the right rule
}

export interface ErrorContext {
  framework?: string;
  environment?: 'browser' | 'node' | 'deno' | 'bun';
  code?: string;
  line?: number;
  column?: number;
}
