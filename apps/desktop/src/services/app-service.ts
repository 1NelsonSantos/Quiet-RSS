import { StorageManager, FeedManager, ArticleManager, CategoryManager } from '@quiet-rss/core';
import { LocalStorageAdapter } from '../storage/localStorage-adapter';

/**
 * Application services that provide access to business logic managers.
 */
export class AppServices {
  public readonly storage: StorageManager;
  public readonly feeds: FeedManager;
  public readonly articles: ArticleManager;
  public readonly categories: CategoryManager;

  constructor() {
    // Initialize storage with localStorage adapter
    const storageAdapter = new LocalStorageAdapter();
    this.storage = new StorageManager(storageAdapter);

    // Initialize business logic managers
    this.feeds = new FeedManager(this.storage);
    this.articles = new ArticleManager(this.storage);
    this.categories = new CategoryManager(this.storage);
  }

  /**
   * Initialize the application services
   */
  async initialize(): Promise<void> {
    console.log('App services initialized');
  }
}

// Create singleton instance for the app
export const appServices = new AppServices();
