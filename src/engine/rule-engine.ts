import { ErrorRule, RuleMatch, ErrorContext } from '../rules/types.js';
import { coreRules } from '../rules/core-rules.js';

export class RuleEngine {
  private rules: ErrorRule[] = [];
  
  constructor(customRules: ErrorRule[] = []) {
    this.rules = [...coreRules, ...customRules];
  }

  /**
   * Find the best matching rule for an error
   */
  findMatch(error: Error, context?: ErrorContext): RuleMatch | null {
    const matches: RuleMatch[] = [];
    
    // Test each rule against the error
    for (const rule of this.rules) {
      if (rule.match(error)) {
        // Calculate confidence based on multiple factors
        const confidence = this.calculateConfidence(rule, error, context);
        matches.push({ rule, error, confidence });
      }
    }
    
    // Sort by confidence and return the best match
    if (matches.length === 0) return null;
    
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches[0];
  }

  /**
   * Calculate how confident we are that this rule matches the error
   */
  private calculateConfidence(rule: ErrorRule, error: Error, context?: ErrorContext): number {
    let confidence = 0.5; // Base confidence
    
    // Exact message match gets higher confidence
    if (error.message.toLowerCase().includes(rule.title.toLowerCase())) {
      confidence += 0.3;
    }
    
    // Framework-specific rules get boost if framework matches
    if (context?.framework && rule.frameworks?.includes(context.framework)) {
      confidence += 0.2;
    }
    
    // Error name matching
    if (error.name && rule.name.toLowerCase().includes(error.name.toLowerCase())) {
      confidence += 0.1;
    }
    
    // Severity-based confidence adjustment
    if (rule.severity === 'critical') confidence += 0.1;
    if (rule.severity === 'high') confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Add custom rules
   */
  addRules(rules: ErrorRule[]): void {
    this.rules.push(...rules);
  }

  /**
   * Get all rules for a specific category
   */
  getRulesByCategory(category: ErrorRule['category']): ErrorRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  /**
   * Get all rules for a specific framework
   */
  getRulesByFramework(framework: string): ErrorRule[] {
    return this.rules.filter(rule => 
      rule.frameworks?.includes(framework)
    );
  }

  /**
   * Get statistics about the rules
   */
  getStats() {
    const stats = {
      totalRules: this.rules.length,
      byCategory: {} as Record<string, number>,
      byFramework: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    };

    for (const rule of this.rules) {
      // Count by category
      stats.byCategory[rule.category] = (stats.byCategory[rule.category] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[rule.severity || 'unknown'] = (stats.bySeverity[rule.severity || 'unknown'] || 0) + 1;
      
      // Count by framework
      if (rule.frameworks) {
        for (const framework of rule.frameworks) {
          stats.byFramework[framework] = (stats.byFramework[framework] || 0) + 1;
        }
      }
    }

    return stats;
  }
}

// Singleton instance for easy usage
export const ruleEngine = new RuleEngine();
