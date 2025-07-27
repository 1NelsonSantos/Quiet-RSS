import type { Feed, Article, FeedCreatePayload, FeedUpdatePayload, RefreshResult } from '@quiet-rss/types';
import { RSSParser } from '../parsers/rss-parser';
import { StorageManager } from '../storage/storage-manager';

/**
 * Feed manager that handles all feed-related  logic including adding feeds,
 * refreshing content, and managing feed data. Handles operations between RSS parsing and storage.
 */
export class FeedManager {
  private parser: RSSParser;

  /**
   * Creates a new Feed Manager instance
   * @param storage - Storage manager for persisting feed data
   */
  constructor(private storage: StorageManager) {
    this.parser = new RSSParser();
  }

  /**
   * Add a new RSS feed to the collection
   * @param payload - Feed creation data including URL and optional category
   * @returns Promise that resolves to the created feed object
   * @throws Error if feed URL is invalid or cannot be parsed
   */
  async addFeed(payload: FeedCreatePayload): Promise<Feed> {
    // Validate the feed URL first
    const validation = await this.parser.validateFeed(payload.url);
    if (!validation.isValid) {
      throw new Error(`Invalid feed: ${validation.error}`);
    }

    // Parse the feed to get initial data
    const parsedFeed = await this.parser.parseFeed(payload.url);

    // Create feed object
    const feed: Feed = {
      id: this.generateId(),
      title: payload.customTitle || parsedFeed.title,
      url: payload.url,
      description: parsedFeed.description,
      categoryId: payload.categoryId,
      lastUpdated: new Date(),
      lastFetched: new Date(),
      favicon: parsedFeed.favicon,
      unreadCount: parsedFeed.articles.length,
      totalCount: parsedFeed.articles.length,
      isActive: true,
      refreshInterval: undefined, // Use default
    };

    // Save feed to storage
    const existingFeeds = await this.storage.loadFeeds();
    existingFeeds.push(feed);
    await this.storage.saveFeeds(existingFeeds);

    // Save initial articles
    const articles: Article[] = parsedFeed.articles.map(parsedArticle => ({
      id: this.generateId(),
      feedId: feed.id,
      title: parsedArticle.title,
      content: parsedArticle.content,
      summary: parsedArticle.summary,
      url: parsedArticle.url,
      publishedAt: parsedArticle.publishedAt,
      isRead: false,
      isStarred: false,
      author: parsedArticle.author,
    }));

    if (articles.length > 0) {
      const existingArticles = await this.storage.loadArticles();
      existingArticles.push(...articles);
      await this.storage.saveArticles(existingArticles);
    }

    return feed;
  }

  /**
   * Update an existing feed's properties
   * @param payload - Feed update data with feed ID and properties to change
   * @returns Promise that resolves to the updated feed object
   * @throws Error if feed is not found
   */
  async updateFeed(payload: FeedUpdatePayload): Promise<Feed> {
    const feeds = await this.storage.loadFeeds();
    const feedIndex = feeds.findIndex(f => f.id === payload.id);

    if (feedIndex === -1) {
      throw new Error(`Feed with ID ${payload.id} not found`);
    }

    // Update feed properties
    const feed = feeds[feedIndex];
    if (payload.title !== undefined) {
      feed.title = payload.title;
    }
    if (payload.categoryId !== undefined) {
      feed.categoryId = payload.categoryId;
    }
    if (payload.refreshInterval !== undefined) {
      feed.refreshInterval = payload.refreshInterval;
    }
    if (payload.isActive !== undefined) {
      feed.isActive = payload.isActive;
    }

    feeds[feedIndex] = feed;
    await this.storage.saveFeeds(feeds);

    return feed;
  }

  /**
   * Remove a feed and all its articles
   * @param feedId - ID of the feed to remove
   * @returns Promise that resolves when feed and articles are removed
   * @throws Error if feed is not found
   */
  async removeFeed(feedId: string): Promise<void> {
    // Remove feed
    const feeds = await this.storage.loadFeeds();
    const filteredFeeds = feeds.filter(f => f.id !== feedId);

    if (filteredFeeds.length === feeds.length) {
      throw new Error(`Feed with ID ${feedId} not found`);
    }

    await this.storage.saveFeeds(filteredFeeds);

    // Remove all articles from this feed
    const articles = await this.storage.loadArticles();
    const filteredArticles = articles.filter(a => a.feedId !== feedId);
    await this.storage.saveArticles(filteredArticles);
  }

  /**
   * Refresh a single feed to fetch new articles
   * @param feedId - ID of the feed to refresh
   * @returns Promise that resolves to refresh result with new article count
   * @throws Error if feed is not found or cannot be refreshed
   */
  async refreshFeed(feedId: string): Promise<RefreshResult> {
    const feeds = await this.storage.loadFeeds();
    const feed = feeds.find(f => f.id === feedId);

    if (!feed) {
      throw new Error(`Feed with ID ${feedId} not found`);
    }

    try {
      // Parse the feed for new content
      const parsedFeed = await this.parser.parseFeed(feed.url);

      // Get existing articles for this feed
      const existingArticles = await this.storage.loadArticles();
      const feedArticles = existingArticles.filter(a => a.feedId === feedId);
      const existingUrls = new Set(feedArticles.map(a => a.url));

      // Find new articles which are not already stored
      const newParsedArticles = parsedFeed.articles.filter(article => !existingUrls.has(article.url));

      // Convert to Article objects
      const newArticles: Article[] = newParsedArticles.map(parsedArticle => ({
        id: this.generateId(),
        feedId: feed.id,
        title: parsedArticle.title,
        content: parsedArticle.content,
        summary: parsedArticle.summary,
        url: parsedArticle.url,
        publishedAt: parsedArticle.publishedAt,
        isRead: false,
        isStarred: false,
        author: parsedArticle.author,
      }));

      // Save new articles
      if (newArticles.length > 0) {
        existingArticles.push(...newArticles);
        await this.storage.saveArticles(existingArticles);
      }

      // Update feed metadata
      feed.lastUpdated = new Date();
      feed.lastFetched = new Date();
      feed.unreadCount += newArticles.length;
      feed.totalCount += newArticles.length;

      const feedIndex = feeds.findIndex(f => f.id === feedId);
      feeds[feedIndex] = feed;
      await this.storage.saveFeeds(feeds);

      return {
        feedId,
        success: true,
        newArticleCount: newArticles.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        feedId,
        success: false,
        newArticleCount: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Refresh all active feeds to fetch new articles
   * @returns Promise that resolves to batch refresh results
   */
  async refreshAllFeeds(): Promise<RefreshResult[]> {
    const feeds = await this.storage.loadFeeds();
    const activeFeeds = feeds.filter(f => f.isActive);

    const refreshPromises = activeFeeds.map(feed => this.refreshFeed(feed.id));

    return Promise.all(refreshPromises);
  }

  /**
   * Get all feeds from storage
   * @returns Promise that resolves to array of all feeds
   */
  async getAllFeeds(): Promise<Feed[]> {
    return this.storage.loadFeeds();
  }

  /**
   * Get a single feed by ID
   * @param feedId - ID of the feed to retrieve
   * @returns Promise that resolves to the feed or null if not found
   */
  async getFeedById(feedId: string): Promise<Feed | null> {
    const feeds = await this.storage.loadFeeds();
    return feeds.find(f => f.id === feedId) || null;
  }

  /**
   * Generate a unique ID for feeds and articles
   * @returns Unique string ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
