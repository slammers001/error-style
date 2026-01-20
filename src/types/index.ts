export interface ErrorExplanation {
  message: string;
  reason: string;
  fix: string;
  suggestions?: string[];
}

export interface PrettyTryResult<T> {
  success: boolean;
  data?: T;
  error?: ErrorExplanation;
}
