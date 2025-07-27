import type { Article, ArticleFilter, ArticleUpdatePayload, SortOption } from '@quiet-rss/types';
import { StorageManager } from '../storage/storage-manager';

/**
 * Article manager that handles all article-related operations including read status,
 * starring, searching, and filtering articles across all feeds.
 */
export class ArticleManager {
  /**
   * Creates a new Article Manager instance
   * @param storage - Storage manager for persisting article data
   */
  constructor(private storage: StorageManager) {}

  /**
   * Get all articles with optional filtering and sorting
   * @param filter - Optional filter criteria for articles
   * @param sort - Optional sort criteria
   * @returns Promise that resolves to filtered and sorted articles
   */
  async getArticles(filter?: ArticleFilter, sort?: SortOption): Promise<Article[]> {
    let articles = await this.storage.loadArticles();

    // Apply filters
    if (filter) {
      articles = this.applyFilter(articles, filter);
    }

    // Apply sorting
    if (sort) {
      articles = this.applySorting(articles, sort);
    }

    return articles;
  }

  /**
   * Get a single article by ID
   * @param articleId - ID of the article to retrieve
   * @returns Promise that resolves to the article or null if not found
   */
  async getArticleById(articleId: string): Promise<Article | null> {
    const articles = await this.storage.loadArticles();

    return articles.find(a => a.id === articleId) || null;
  }

  /**
   * Get articles for a specific feed
   * @param feedId - ID of the feed
   * @param filter - Optional additional filter criteria
   * @param sort - Optional sort criteria
   * @returns Promise that resolves to feed's articles
   */
  async getArticlesByFeed(feedId: string, filter?: ArticleFilter, sort?: SortOption): Promise<Article[]> {
    const feedFilter: ArticleFilter = { ...filter, feedId };

    return this.getArticles(feedFilter, sort);
  }

  /**
   * Update article properties (read status, starred status)
   * @param payload - Article update data with ID and properties to change
   * @returns Promise that resolves to the updated article
   * @throws Error if article is not found
   */
  async updateArticle(payload: ArticleUpdatePayload): Promise<Article> {
    const articles = await this.storage.loadArticles();
    const articleIndex = articles.findIndex(a => a.id === payload.id);

    if (articleIndex === -1) {
      throw new Error(`Article with ID ${payload.id} not found`);
    }

    const article = articles[articleIndex];
    if (payload.isRead !== undefined) {
      article.isRead = payload.isRead;
    }
    if (payload.isStarred !== undefined) {
      article.isStarred = payload.isStarred;
    }

    articles[articleIndex] = article;
    await this.storage.saveArticles(articles);

    return article;
  }

  /**
   * Mark an article as read
   * @param articleId - ID of the article to mark as read
   * @returns Promise that resolves to the updated article
   */
  async markAsRead(articleId: string): Promise<Article> {
    return this.updateArticle({ id: articleId, isRead: true });
  }

  /**
   * Mark an article as unread
   * @param articleId - ID of the article to mark as unread
   * @returns Promise that resolves to the updated article
   */
  async markAsUnread(articleId: string): Promise<Article> {
    return this.updateArticle({ id: articleId, isRead: false });
  }

  /**
   * Toggle starred status of an article
   * @param articleId - ID of the article to toggle
   * @returns Promise that resolves to the updated article
   */
  async toggleStar(articleId: string): Promise<Article> {
    const article = await this.getArticleById(articleId);
    if (!article) {
      throw new Error(`Article with ID ${articleId} not found`);
    }

    return this.updateArticle({ id: articleId, isStarred: !article.isStarred });
  }

  /**
   * Mark all articles in a feed as read
   * @param feedId - ID of the feed
   * @returns Promise that resolves to count of updated articles
   */
  async markFeedAsRead(feedId: string): Promise<number> {
    const articles = await this.storage.loadArticles();
    let updatedCount = 0;

    for (const article of articles) {
      if (article.feedId === feedId && !article.isRead) {
        article.isRead = true;
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      await this.storage.saveArticles(articles);
    }

    return updatedCount;
  }

  /**
   * Mark all articles as read
   * @returns Promise that resolves to count of updated articles
   */
  async markAllAsRead(): Promise<number> {
    const articles = await this.storage.loadArticles();
    let updatedCount = 0;

    for (const article of articles) {
      if (!article.isRead) {
        article.isRead = true;
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      await this.storage.saveArticles(articles);
    }

    return updatedCount;
  }

  /**
   * Search articles by text query (title and content)
   * @param query - Search query string
   * @param filter - Optional additional filter criteria
   * @returns Promise that resolves to matching articles
   */
  async searchArticles(query: string, filter?: ArticleFilter): Promise<Article[]> {
    const searchFilter: ArticleFilter = { ...filter, searchQuery: query };

    return this.getArticles(searchFilter);
  }

  /**
   * Get starred articles
   * @param filter - Optional additional filter criteria
   * @param sort - Optional sort criteria
   * @returns Promise that resolves to starred articles
   */
  async getStarredArticles(filter?: ArticleFilter, sort?: SortOption): Promise<Article[]> {
    const starredFilter: ArticleFilter = { ...filter, isStarred: true };

    return this.getArticles(starredFilter, sort);
  }

  /**
   * Get unread articles
   * @param filter - Optional additional filter criteria
   * @param sort - Optional sort criteria
   * @returns Promise that resolves to unread articles
   */
  async getUnreadArticles(filter?: ArticleFilter, sort?: SortOption): Promise<Article[]> {
    const unreadFilter: ArticleFilter = { ...filter, isRead: false };

    return this.getArticles(unreadFilter, sort);
  }

  /**
   * Get article statistics
   * @returns Promise that resolves to article counts
   */
  async getArticleStats(): Promise<{ total: number; unread: number; starred: number }> {
    const articles = await this.storage.loadArticles();

    return {
      total: articles.length,
      unread: articles.filter(a => !a.isRead).length,
      starred: articles.filter(a => a.isStarred).length,
    };
  }

  /**
   * Clean up old articles based on age
   * @param maxAgeInDays - Maximum age in days to keep articles
   * @returns Promise that resolves to count of removed articles
   */
  async cleanupOldArticles(maxAgeInDays: number): Promise<number> {
    const articles = await this.storage.loadArticles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

    const filteredArticles = articles.filter(article => {
      // Keep starred articles regardless of age
      if (article.isStarred) {
        return true;
      }

      // Keep articles newer than cutoff
      return new Date(article.publishedAt) > cutoffDate;
    });

    const removedCount = articles.length - filteredArticles.length;

    if (removedCount > 0) {
      await this.storage.saveArticles(filteredArticles);
    }

    return removedCount;
  }

  /**
   * Apply filter criteria to articles array
   * @param articles - Articles to filter
   * @param filter - Filter criteria
   * @returns Filtered articles array
   */
  private applyFilter(articles: Article[], filter: ArticleFilter): Article[] {
    return articles.filter(article => {
      if (filter.feedId && article.feedId !== filter.feedId) {
        return false;
      }
      if (filter.isRead !== undefined && article.isRead !== filter.isRead) {
        return false;
      }
      if (filter.isStarred !== undefined && article.isStarred !== filter.isStarred) {
        return false;
      }

      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const titleMatch = article.title.toLowerCase().includes(query);
        const contentMatch = article.content.toLowerCase().includes(query);

        if (!titleMatch && !contentMatch) {
          return false;
        }
      }

      if (filter.dateRange) {
        const articleDate = new Date(article.publishedAt);
        if (articleDate < filter.dateRange.start || articleDate > filter.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Apply sorting to articles array
   * @param articles - Articles to sort
   * @param sort - Sort criteria
   * @returns Sorted articles array
   */
  private applySorting(articles: Article[], sort: SortOption): Article[] {
    return articles.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'publishedAt':
          comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          break;
        default:
          comparison = 0;
      }

      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }
}
