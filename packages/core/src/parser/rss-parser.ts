import Parser from 'rss-parser';
import type { ParsedFeed, ParsedArticle, FeedValidationResult } from '@quiet-rss/types';

/**
 * RSS/Atom feed parser that handles feed validation, parsing, and data extraction
 */
export class RSSParser {
  private parser: Parser;

  /**
   * Creates a new RSS parser instance with custom field configuration
   */
  constructor() {
    this.parser = new Parser({
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
      // Basic URL validation
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(url)) {
        return {
          isValid: false,
          error: 'Invalid URL format - must start with http:// or https://',
        };
      }

      // Try to parse the feed to validate it
      const feed = await this.parser.parseURL(url);

      return {
        isValid: true,
        feedType: this.detectFeedType(feed),
        title: feed.title || 'Unknown Feed',
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to validate feed',
      };
    }
  }

  /**
   * Parse RSS feed from URL and return data
   * @param url - The RSS/Atom feed URL to parse
   * @returns Promise that resolves to parsed feed data with articles
   * @throws Error if the feed cannot be parsed or fetched
   */
  async parseFeed(url: string): Promise<ParsedFeed> {
    try {
      const feed = await this.parser.parseURL(url);

      return {
        title: feed.title || 'Unknown Feed',
        description: feed.description,
        url: url,
        favicon: this.extractFavicon(feed.link),
        articles: this.parseArticles(feed.items || []),
      };
    } catch (error) {
      throw new Error(`Failed to parse RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
}
