import React, { useMemo } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';
import { VirtualList, VirtualListItem, ArticleCard } from './index';

// Search Highlight utility component
interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, searchQuery, className = '' }) => {
  if (!searchQuery || searchQuery.trim() === '') {
    return <span className={className}>{text}</span>;
  }

  const query = searchQuery.trim().toLowerCase();
  const lowerText = text.toLowerCase();
  const parts = [];
  let lastIndex = 0;
  let index = lowerText.indexOf(query);

  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, index),
        highlight: false,
      });
    }

    // Add highlighted match
    parts.push({
      text: text.slice(index, index + query.length),
      highlight: true,
    });

    lastIndex = index + query.length;
    index = lowerText.indexOf(query, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      highlight: false,
    });
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} className="qr-search-highlight">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
};

// ArticleCard with search highlighting
interface SearchArticleCardProps {
  article: any; // Article type
  feed?: any; // Feed type
  searchQuery: string;
  onClick?: (article: any) => void;
  onToggleRead?: (articleId: string, isRead: boolean) => void;
  onToggleStar?: (articleId: string, isStarred: boolean) => void;
  showSource?: boolean;
  showSummary?: boolean;
  contentLines?: number;
}

const SearchArticleCard: React.FC<SearchArticleCardProps> = ({
  article,
  feed,
  searchQuery,
  onClick,
  onToggleRead,
  onToggleStar,
  showSource = true,
  showSummary = true,
  contentLines = 2,
}) => {
  // If no search query, use standard ArticleCard
  if (!searchQuery || searchQuery.trim() === '') {
    return (
      <ArticleCard
        article={article}
        feed={feed}
        onClick={onClick}
        onToggleRead={onToggleRead}
        onToggleStar={onToggleStar}
        showSource={showSource}
        showSummary={showSummary}
        contentLines={contentLines}
      />
    );
  }

  // Custom rendering with search highlighting using ArticleCard CSS classes
  const getContentPreview = () => {
    const content = showSummary && article.summary ? article.summary : article.content;
    if (!content) {
      return '';
    }

    // Strip HTML tags and limit content
    const cleanContent = content.replace(/<[^>]*>/g, '');
    const words = cleanContent.split(' ');

    if (words.length > 50) {
      return words.slice(0, 50).join(' ') + '...';
    }

    return cleanContent;
  };

  const classes = [
    'qr-article-card',
    'qr-article-card--primary',
    'qr-article-card--md',
    !article.isRead && 'qr-article-card--unread',
    article.isStarred && 'qr-article-card--starred',
    onClick && 'qr-article-card--interactive',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes}>
      {/* Article Header */}
      <div className="qr-article-card__header">
        <div className="qr-article-card__meta">
          {showSource && feed && (
            <div className="qr-article-card__source">
              {feed.favicon && (
                <img src={feed.favicon} alt={`${feed.title} favicon`} className="qr-article-card__favicon" />
              )}
              <SearchHighlight text={feed.title} searchQuery={searchQuery} className="qr-article-card__source-name" />
            </div>
          )}
          <time className="qr-article-card__date">
            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}
          </time>
        </div>

        <div className="qr-article-card__actions">
          <button
            className={`qr-article-card__star ${article.isStarred ? 'qr-article-card__star--active' : ''}`}
            onClick={e => {
              e.stopPropagation();
              onToggleStar?.(article.id, !article.isStarred);
            }}
            title={article.isStarred ? 'Remove star' : 'Add star'}
          >
            ⭐
          </button>
          <button
            className={`qr-article-card__read ${
              article.isRead ? 'qr-article-card__read--read' : 'qr-article-card__read--unread'
            }`}
            onClick={e => {
              e.stopPropagation();
              onToggleRead?.(article.id, !article.isRead);
            }}
            title={article.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {article.isRead ? '✓' : '○'}
          </button>
        </div>
      </div>

      {/* Article Content */}
      <div className="qr-article-card__content" onClick={() => onClick?.(article)}>
        <h3 className="qr-article-card__title">
          <SearchHighlight text={article.title} searchQuery={searchQuery} />
        </h3>

        <div className="qr-article-card__preview">
          {showSummary && article.summary ? (
            <p
              className="qr-article-card__summary"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: contentLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              <SearchHighlight text={article.summary} searchQuery={searchQuery} />
            </p>
          ) : (
            <p
              className="qr-article-card__content-text"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: contentLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              <SearchHighlight text={getContentPreview()} searchQuery={searchQuery} />
            </p>
          )}
        </div>

        {article.author && (
          <div className="qr-article-card__author">
            By{' '}
            <SearchHighlight text={article.author} searchQuery={searchQuery} className="qr-article-card__author-name" />
          </div>
        )}
      </div>
    </article>
  );
};

// Main SearchResults component interfaces
export interface SearchResultsProps extends Omit<BaseComponentProps, 'variant'> {
  // Search data
  articles: VirtualListItem[];
  searchQuery: string;

  // Filtering and sorting
  totalResultCount?: number;
  searchFields?: ('title' | 'content' | 'author' | 'source')[];

  // Article interaction handlers
  onArticleClick?: (article: any) => void;
  onToggleRead?: (articleId: string, isRead: boolean) => void;
  onToggleStar?: (articleId: string, isStarred: boolean) => void;

  // Search controls
  onClearSearch?: () => void;
  onSearchQueryChange?: (query: string) => void;

  // Display options
  showResultCount?: boolean;
  showClearButton?: boolean;
  showSource?: boolean;
  showSummary?: boolean;
  contentLines?: number;

  // VirtualList options
  containerHeight: number | string;
  estimatedItemHeight?: number;

  // Styling
  className?: string;
  style?: React.CSSProperties;

  // Empty state
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: React.ReactNode;
}

/**
 * SearchResults component for displaying filtered article search results
 * @param articles - Filtered articles matching the search query
 * @param searchQuery - Current search query string
 * @param totalResultCount - Total number of search results (if different from articles.length)
 * @param searchFields - Fields that were searched (for display purposes)
 * @param onArticleClick - Handler for article clicks
 * @param onToggleRead - Handler for read/unread toggle
 * @param onToggleStar - Handler for star/unstar toggle
 * @param onClearSearch - Handler to clear search and return to full list
 * @param onSearchQueryChange - Handler for search query changes
 * @param showResultCount - Whether to display result count header
 * @param showClearButton - Whether to show clear search button
 * @param showSource - Whether to show article source in cards
 * @param showSummary - Whether to show article summary in cards
 * @param contentLines - Maximum lines for article content preview
 * @param containerHeight - Height of the scrollable container
 * @param estimatedItemHeight - Estimated height per article for VirtualList
 * @param emptyStateTitle - Custom title for no results state
 * @param emptyStateDescription - Custom description for no results state
 * @param emptyStateAction - Custom action component for no results state
 * @param size - Component size variant (sm, md, lg)
 * @param disabled - Whether the component is disabled
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  articles,
  searchQuery,
  totalResultCount,
  searchFields = ['title', 'content'],
  onArticleClick,
  onToggleRead,
  onToggleStar,
  onClearSearch,
  onSearchQueryChange,
  showResultCount = true,
  showClearButton = true,
  showSource = true,
  showSummary = true,
  contentLines = 2,
  containerHeight,
  estimatedItemHeight = 120,
  emptyStateTitle = 'No results found',
  emptyStateDescription,
  emptyStateAction,
  size = 'md',
  disabled = false,
  className = '',
  style,
}) => {
  const resultCount = totalResultCount ?? articles.length;
  const hasResults = articles.length > 0;

  // Generate dynamic empty state description
  const defaultEmptyDescription = searchQuery
    ? `No articles found matching "${searchQuery}". Try a different search term or check your spelling.`
    : 'Enter a search query to find articles.';

  const emptyDescription = emptyStateDescription ?? defaultEmptyDescription;

  // Generate search summary text
  const searchSummary = useMemo(() => {
    if (!searchQuery) return '';

    const fieldsText =
      searchFields.length > 1
        ? `in ${searchFields.slice(0, -1).join(', ')} and ${searchFields.slice(-1)}`
        : `in ${searchFields[0]}`;

    return `Searching ${fieldsText}`;
  }, [searchQuery, searchFields]);

  const classes = [
    'qr-search-results',
    `qr-search-results--${size}`,
    disabled && 'qr-search-results--disabled',
    !hasResults && 'qr-search-results--empty',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: classes,
    style,
  };

  return (
    <div {...containerProps}>
      {/* Search Results Header - Always reserve space to prevent layout shift */}
      <div className="qr-search-results__header">
        <div className="qr-search-results__info">
          {showResultCount && searchQuery && (
            <div className="qr-search-results__count">
              <span className="qr-search-results__count-number">{resultCount.toLocaleString()}</span>
              <span className="qr-search-results__count-text">{resultCount === 1 ? 'result' : 'results'} for</span>
              <span className="qr-search-results__count-query">"{searchQuery}"</span>
            </div>
          )}
          {searchSummary && searchQuery && <div className="qr-search-results__summary">{searchSummary}</div>}
          {!searchQuery && (
            <div className="qr-search-results__placeholder">Enter a search query to filter articles</div>
          )}
        </div>

        {showClearButton && onClearSearch && (
          <button
            className="qr-search-results__clear"
            onClick={onClearSearch}
            disabled={disabled || !searchQuery}
            title="Clear search and show all articles"
            style={{ opacity: searchQuery ? 1 : 0, pointerEvents: searchQuery ? 'auto' : 'none' }}
          >
            Clear search
          </button>
        )}
      </div>

      {/* Search Results List */}
      <div className="qr-search-results__content">
        {hasResults ? (
          <VirtualList
            items={articles}
            containerHeight={containerHeight}
            itemHeight="auto"
            estimatedItemHeight={estimatedItemHeight}
            overscanCount={3}
            renderItem={({ item: article }) => (
              <div className="qr-search-results__item">
                <SearchArticleCard
                  article={article}
                  searchQuery={searchQuery}
                  onClick={onArticleClick}
                  onToggleRead={onToggleRead}
                  onToggleStar={onToggleStar}
                  showSource={showSource}
                  showSummary={showSummary}
                  contentLines={contentLines}
                />
              </div>
            )}
            emptyComponent={
              <div className="qr-search-results__empty">
                <h3 className="qr-search-results__empty-title">{emptyStateTitle}</h3>
                <p className="qr-search-results__empty-description">{emptyDescription}</p>
                {emptyStateAction && <div className="qr-search-results__empty-action">{emptyStateAction}</div>}
              </div>
            }
            ariaLabel={`Search results for ${searchQuery}`}
            disabled={disabled}
          />
        ) : (
          <div className="qr-search-results__empty">
            <h3 className="qr-search-results__empty-title">{emptyStateTitle}</h3>
            <p className="qr-search-results__empty-description">{emptyDescription}</p>
            {emptyStateAction && <div className="qr-search-results__empty-action">{emptyStateAction}</div>}
            {onClearSearch && searchQuery && (
              <button className="qr-search-results__empty-clear" onClick={onClearSearch} disabled={disabled}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { SearchHighlight };
export type { SearchHighlightProps, SearchArticleCardProps };
