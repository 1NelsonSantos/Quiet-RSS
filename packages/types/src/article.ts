export interface Article {
  id: string;
  feedId: string;
  title: string;
  content: string;
  summary?: string;
  url: string;
  publishedAt: Date;
  isRead: boolean;
  isStarred: boolean;
  author?: string;
  tags?: string[];
}

export interface ArticleFilter {
  feedId?: string;
  categoryId?: string;
  isRead?: boolean;
  isStarred?: boolean;
  searchQuery?: string;
  dateRange?: { start: Date; end: Date };
}

export interface ArticleUpdatePayload {
  id: string;
  isRead?: boolean;
  isStarred?: boolean;
}
