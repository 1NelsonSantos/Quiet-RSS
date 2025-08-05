import Parser from 'rss-parser';
import type {
  ParsedFeed,
  ParsedArticle,
  FeedValidationResult,
  RSSParserConfig,
  RSSParsingError,
} from '@quiet-rss/types';
import { RSSErrorType } from '@quiet-rss/types';

/**
 * RSS/Atom feed parser that handles feed validation, parsing, and data extraction
 */
export class RSSParser {
  private parser: Parser;
  private config: Required<RSSParserConfig>;

  /**
   * Creates a new RSS parser instance with custom field configuration
   * @param config - Optional configuration for timeouts, retries, and user agent
   */
  constructor(config: RSSParserConfig = {}) {
    this.config = {
      timeout: config.timeout || 10000, // 10 seconds
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000, // 1 second
      userAgent: config.userAgent || 'Quiet-RSS/1.0 (+https://github.com/quiet-rss/quiet-rss)',
    };

    this.parser = new Parser({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'Accept-Encoding': 'gzip, deflate',
      },
      // Custom fields to extract from RSS feeds
      customFields: {
        feed: ['language', 'copyright', 'managingEditor', 'webMaster'],
        item: ['guid', 'category', 'comments', 'enclosure'],
      },
    });
  }

  /**
   * Validate if a URL contains a valid RSS/Atom feed
   * @param url - The feed URL to validate
   * @returns Promise that resolves to validation result with feed info or error
   */
  async validateFeed(url: string): Promise<FeedValidationResult> {
    try {
      // Enhanced URL validation
      if (!this.isValidUrl(url)) {
        return {
          isValid: false,
          error: 'Invalid URL format - must be a valid HTTP or HTTPS URL',
          errorType: RSSErrorType.INVALID_URL,
        };
      }

      // Try to parse the feed with retry logic
      const feed = await this.parseWithRetries(url);

      return {
        isValid: true,
        feedType: this.detectFeedType(feed),
        title: feed.title || 'Unknown Feed',
      };
    } catch (error) {
      const errorInfo = this.parseError(error);

      return {
        isValid: false,
        error: errorInfo.message,
        errorType: errorInfo.type,
        statusCode: errorInfo.statusCode,
      };
    }
  }

  /**
   * Parse RSS feed from URL and return data
   * @param url - The RSS/Atom feed URL to parse
   * @returns Promise that resolves to parsed feed data with articles
   * @throws Error with specific error information if the feed cannot be parsed or fetched
   */
  async parseFeed(url: string): Promise<ParsedFeed> {
    try {
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL format - must be a valid HTTP or HTTPS URL');
      }

      const feed = await this.parseWithRetries(url);

      return {
        title: feed.title || 'Unknown Feed',
        description: feed.description,
        url: url,
        favicon: this.extractFavicon(feed.link),
        articles: this.parseArticles(feed.items || []),
      };
    } catch (error) {
      const errorInfo = this.parseError(error);

      throw new Error(`${errorInfo.type}: ${errorInfo.message}`);
    }
  }

  /**
   * Parse articles from RSS feed items into standardized format
   * @param items - Raw RSS feed items from the parser
   * @returns Array of parsed articles with standardized fields
   */
  private parseArticles(items: any[]): ParsedArticle[] {
    return items.map(item => ({
      title: item.title || 'Untitled Article',
      content: item.content || item['content:encoded'] || item.contentSnippet || '',
      summary: item.contentSnippet || item.summary || '',
      url: item.link || '',
      publishedAt: new Date(item.pubDate || Date.now()),
      author: item.creator || item.author || undefined,
      guid: item.guid || item.id || undefined,
    }));
  }

  /**
   * Detect whether the feed is RSS or Atom format
   * @param feed - Parsed feed object from rss-parser
   * @returns Feed type identifier
   */
  private detectFeedType(feed: any): 'rss' | 'atom' {
    // rss-parser normalizes feeds, but we can check some properties
    if (feed.feedUrl?.includes('atom') || feed.generator?.toLowerCase().includes('atom')) {
      return 'atom';
    }
    return 'rss';
  }

  /**
   * Extract favicon URL from the feed's website
   * @param feedLink - The website URL associated with the feed
   * @returns Favicon URL or undefined if cannot be determined
   */
  private extractFavicon(feedLink?: string): string | undefined {
    if (!feedLink) {
      return undefined;
    }

    try {
      const url = new URL(feedLink);

      return `${url.protocol}//${url.hostname}/favicon.ico`;
    } catch {
      return undefined;
    }
  }

  /**
   * Enhanced URL validation using URL constructor
   * @param url - URL to validate
   * @returns True if URL is valid HTTP/HTTPS URL
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);

      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Parse feed with retry logic
   * @param url - Feed URL to parse
   * @returns Promise that resolves to parsed feed
   * @throws Error if all retry attempts fail
   */
  private async parseWithRetries(url: string): Promise<any> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.parser.parseURL(url);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Don't retry for certain error types
        if (this.shouldNotRetry(error)) {
          throw lastError;
        }

        // Wait before retrying (except on last attempt)
        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if error should not be retried
   * @param error - Error to check
   * @returns True if error should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    // Don't retry for client errors (4xx) except 429 (rate limited)
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      return true;
    }

    // Don't retry for parse errors
    if (error.message?.includes('Invalid XML') || error.message?.includes('Not a feed')) {
      return true;
    }

    return false;
  }

  /**
   * Parse error into structured error information
   * @param error - Raw error from parsing
   * @returns Structured error information
   */
  private parseError(error: any): RSSParsingError {
    const baseMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = error.status;

    // Check network errors first
    const networkError = this.getNetworkError(error.code, baseMessage);
    if (networkError) {
      return {
        message: networkError.message,
        type: networkError.type,
        statusCode,
        originalError: error instanceof Error ? error : undefined,
      };
    }

    // Check HTTP status errors
    const httpError = this.getHttpError(statusCode);
    if (httpError) {
      return {
        message: httpError.message,
        type: httpError.type,
        statusCode,
        originalError: error instanceof Error ? error : undefined,
      };
    }

    // Check parse errors
    if (this.isParseError(baseMessage)) {
      return {
        message: baseMessage,
        type: RSSErrorType.PARSE_ERROR,
        statusCode,
        originalError: error instanceof Error ? error : undefined,
      };
    }

    // Default to network error
    return {
      message: baseMessage,
      type: RSSErrorType.NETWORK_ERROR,
      statusCode,
      originalError: error instanceof Error ? error : undefined,
    };
  }

  /**
   * Get network error type and message based on error code
   * @param code - Error code from network request
   * @param message - Original error message
   * @returns Network error info or null if not a network error
   */
  private getNetworkError(code: string, message: string): { type: RSSErrorType; message: string } | null {
    const networkErrors: Record<string, { type: RSSErrorType; message: string }> = {
      ENOTFOUND: { type: RSSErrorType.NETWORK_ERROR, message: 'Domain not found or network connection failed' },
      ECONNREFUSED: { type: RSSErrorType.NETWORK_ERROR, message: 'Connection refused by server' },
      ETIMEDOUT: { type: RSSErrorType.TIMEOUT_ERROR, message: 'Request timed out' },
    };

    if (code && networkErrors[code]) {
      return networkErrors[code];
    }

    if (message.includes('timeout')) {
      return { type: RSSErrorType.TIMEOUT_ERROR, message: 'Request timed out' };
    }

    return null;
  }

  /**
   * Get HTTP error type and message based on status code
   * @param status - HTTP status code
   * @returns HTTP error info or null if not an HTTP error
   */
  private getHttpError(status: number): { type: RSSErrorType; message: string } | null {
    if (!status) {
      return null;
    }

    const httpErrors: Record<number, { type: RSSErrorType; message: string }> = {
      404: { type: RSSErrorType.NOT_FOUND, message: 'Feed not found (404)' },
      403: { type: RSSErrorType.ACCESS_DENIED, message: 'Access denied (403)' },
    };

    if (httpErrors[status]) {
      return httpErrors[status];
    }

    if (status >= 500) {
      return { type: RSSErrorType.SERVER_ERROR, message: `Server error (${status})` };
    }

    return null;
  }

  /**
   * Check if error message indicates a parsing error
   * @param message - Error message to check
   * @returns True if this is a parsing error
   */
  private isParseError(message: string): boolean {
    const parseErrorPatterns = ['Invalid XML', 'Not a feed', 'parse'];
    return parseErrorPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Delay execution for specified milliseconds
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
