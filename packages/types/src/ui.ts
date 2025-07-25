import type { ArticleFilter } from './article';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface SortOption {
  field: 'title' | 'publishedAt' | 'feedTitle';
  direction: 'asc' | 'desc';
}

export interface ViewState {
  selectedFeedId?: string;
  selectedCategoryId?: string;
  selectedArticleId?: string;
  searchQuery: string;
  sortBy: SortOption;
  filter: ArticleFilter;
}

export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'cmd' | 'shift' | 'alt')[];
  action: string;
  description: string;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
