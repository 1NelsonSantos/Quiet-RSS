import type { Feed } from './feed';
import type { Article } from './article';
import type { Category } from './category';
import type { UserSettings, ReadingPreferences, NotificationSettings } from './user';
import type { FeedCreatePayload } from './feed';
import type { CategoryCreatePayload } from './category';

export interface StorageData {
  feeds: Feed[];
  articles: Article[];
  categories: Category[];
  settings: UserSettings;
  readingPreferences: ReadingPreferences;
  notifications: NotificationSettings;
  lastSync?: Date;
}

export interface CacheConfig {
  maxArticles: number;
  maxAge: number; // in days
  cleanupInterval: number; // in hours
}

export interface ImportData {
  feeds: FeedCreatePayload[];
  categories: CategoryCreatePayload[];
}

export interface ExportData {
  feeds: Feed[];
  categories: Category[];
  exportDate: Date;
  version: string;
}
