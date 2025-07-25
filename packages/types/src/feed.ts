export interface Feed {
  id: string;
  title: string;
  url: string;
  description?: string;
  categoryId?: string;
  lastUpdated: Date;
  lastFetched?: Date;
  favicon?: string;
  unreadCount: number;
  totalCount: number;
  isActive: boolean;
  refreshInterval?: number; // in minutes
}

export interface FeedCreatePayload {
  url: string;
  categoryId?: string;
  customTitle?: string;
}

export interface FeedUpdatePayload {
  id: string;
  title?: string;
  categoryId?: string;
  refreshInterval?: number;
  isActive?: boolean;
}

export interface ParsedFeed {
  title: string;
  description?: string;
  url: string;
  favicon?: string;
  articles: ParsedArticle[];
}

export interface ParsedArticle {
  title: string;
  content: string;
  summary?: string;
  url: string;
  publishedAt: Date;
  author?: string;
  guid?: string;
}
