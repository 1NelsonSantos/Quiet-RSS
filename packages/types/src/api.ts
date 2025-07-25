export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface FeedValidationResult {
  isValid: boolean;
  feedType?: 'rss' | 'atom';
  title?: string;
  error?: string;
}

export interface RefreshResult {
  feedId: string;
  success: boolean;
  newArticleCount: number;
  error?: string;
}

export interface BatchRefreshResult {
  results: RefreshResult[];
  totalNew: number;
  totalErrors: number;
}
