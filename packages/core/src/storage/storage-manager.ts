import type { StorageAdapter } from './storage-adapter';
import type { Feed, Article, Category, UserSettings } from '@quiet-rss/types';

/**
 * Storage manager that handles all RSS reader data operations using an adapter.
 * Provides methods for storing and retrieving feeds, articles, categories, and settings.
 */
export class StorageManager {
  // Storage keys used for different data types
  private static readonly KEYS = {
    FEEDS: 'quiet-rss:feeds',
    ARTICLES: 'quiet-rss:articles',
    CATEGORIES: 'quiet-rss:categories',
    SETTINGS: 'quiet-rss:settings',
  } as const;

  /**
   * Creates a new StorageManager instance
   * @param adapter - The storage adapter to use for persistence (localStorage or AsyncStorage)
   */
  constructor(private adapter: StorageAdapter) {}

  /**
   * Feeds
   */

  /**
   * Save an array of feeds to storage
   * @param feeds - Array of feed objects to save
   * @returns Promise that resolves when save is complete
   * @throws Error if serialization or storage fails
   */
  async saveFeeds(feeds: Feed[]): Promise<void> {
    await this.adapter.setItem(
      StorageManager.KEYS.FEEDS,
      JSON.stringify(feeds)
    );
  }

  /**
   * Load all feeds from storage
   * @returns Promise that resolves to array of feeds, empty array if none exist
   * @throws Error if deserialization fails
   */
  async loadFeeds(): Promise<Feed[]> {
    const data = await this.adapter.getItem(StorageManager.KEYS.FEEDS);

    return data ? JSON.parse(data) : [];
  }

  /**
   * Articles
   */

  /**
   * Save an array of articles to storage
   * @param articles - Array of article objects to save
   * @returns Promise that resolves when save is complete
   * @throws Error if serialization or storage fails
   */
  async saveArticles(articles: Article[]): Promise<void> {
    await this.adapter.setItem(
      StorageManager.KEYS.ARTICLES,
      JSON.stringify(articles)
    );
  }

  /**
   * Load all articles from storage
   * @returns Promise that resolves to array of articles, empty array if none exist
   * @throws Error if deserialization fails
   */
  async loadArticles(): Promise<Article[]> {
    const data = await this.adapter.getItem(StorageManager.KEYS.ARTICLES);

    return data ? JSON.parse(data) : [];
  }

  /**
   * Categories
   */

  /**
   * Save an array of categories to storage
   * @param categories - Array of category objects to save
   * @returns Promise that resolves when save is complete
   * @throws Error if serialization or storage fails
   */
  async saveCategories(categories: Category[]): Promise<void> {
    await this.adapter.setItem(
      StorageManager.KEYS.CATEGORIES,
      JSON.stringify(categories)
    );
  }

  /**
   * Load all categories from storage
   * @returns Promise that resolves to array of categories, empty array if none exist
   * @throws Error if deserialization fails
   */
  async loadCategories(): Promise<Category[]> {
    const data = await this.adapter.getItem(StorageManager.KEYS.CATEGORIES);

    return data ? JSON.parse(data) : [];
  }

  /**
   * Settings
   */

  /**
   * Save user settings to storage
   * @param settings - User settings object to save
   * @returns Promise that resolves when save is complete
   * @throws Error if serialization or storage fails
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    await this.adapter.setItem(
      StorageManager.KEYS.SETTINGS,
      JSON.stringify(settings)
    );
  }

  /**
   * Load user settings from storage
   * @returns Promise that resolves to user settings, default settings if none exist
   * @throws Error if deserialization fails
   */
  async loadSettings(): Promise<UserSettings> {
    const data = await this.adapter.getItem(StorageManager.KEYS.SETTINGS);

    return data ? JSON.parse(data) : this.getDefaultSettings();
  }

  /**
   * Utils
   */

  /**
   * Clear all stored data (feeds, articles, categories, settings)
   * @returns Promise that resolves when all data is cleared
   * @throws Error if any removal operation fails
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.adapter.removeItem(StorageManager.KEYS.FEEDS),
      this.adapter.removeItem(StorageManager.KEYS.ARTICLES),
      this.adapter.removeItem(StorageManager.KEYS.CATEGORIES),
      this.adapter.removeItem(StorageManager.KEYS.SETTINGS),
    ]);
  }

  /**
   * Get default user settings when none are stored
   * @returns Default UserSettings object with sensible defaults
   * @private
   */
  private getDefaultSettings(): UserSettings {
    return {
      theme: 'system',
      fontSize: 'medium',
      refreshInterval: 120,
      notificationsEnabled: true,
      markAsReadOnScroll: false,
      showUnreadOnly: false,
    };
  }
}
