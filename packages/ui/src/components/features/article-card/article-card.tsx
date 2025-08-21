import React from 'react';
import { Article, Feed, BaseComponentProps } from '@quiet-rss/types';

export interface ArticleCardProps extends Omit<BaseComponentProps, 'loading'> {
  // Article data to display
  article: Article;
  // Feed data for source information
  feed?: Pick<Feed, 'title' | 'favicon'>;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // Click handler for article interaction
  onClick?: (article: Article) => void;
  // Handler for read/unread toggle
  onToggleRead?: (articleId: string, isRead: boolean) => void;
  // Handler for star/unstar toggle
  onToggleStar?: (articleId: string, isStarred: boolean) => void;
  // Whether to show feed source info
  showSource?: boolean;
  // Whether to show full content or summary
  showSummary?: boolean;
  // Maximum lines for content preview
  contentLines?: number;
}

/**
 * Article Card component for displaying RSS article information
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the card is disabled
 * @param article - Article data to display
 * @param feed - Feed data for source information
 * @param showSource - Whether to show feed source info
 * @param showSummary - Whether to show content summary
 * @param contentLines - Maximum lines for content preview
 * @param onClick - Click handler for article interaction
 * @param onToggleRead - Handler for read/unread toggle
 * @param onToggleStar - Handler for star/unstar toggle
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const ArticleCard: React.FC<ArticleCardProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  article,
  feed,
  showSource = true,
  showSummary = true,
  contentLines = 3,
  onClick,
  onToggleRead,
  onToggleStar,
  className = '',
  style,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('.qr-article-card__action')) {
      return;
    }
    onClick?.(article);
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleRead?.(article.id, !article.isRead);
  };

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar?.(article.id, !article.isStarred);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getContentPreview = () => {
    const content = showSummary && article.summary ? article.summary : article.content;
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
    `qr-article-card--${variant}`,
    `qr-article-card--${size}`,
    !article.isRead && 'qr-article-card--unread',
    article.isStarred && 'qr-article-card--starred',
    onClick && 'qr-article-card--interactive',
    disabled && 'qr-article-card--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cardProps: React.HTMLAttributes<HTMLDivElement> = {
    className: classes,
    style,
    ...(onClick && {
      onClick: disabled ? undefined : handleCardClick,
      role: 'button',
      tabIndex: disabled ? -1 : 0,
      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleCardClick(e as any);
        }
      },
    }),
  };

  return (
    <article {...cardProps}>
      {/* Article Header */}
      <div className="qr-article-card__header">
        <h3 className="qr-article-card__title">{article.title}</h3>
        <div className="qr-article-card__actions">
          {onToggleRead && (
            <button
              className="qr-article-card__action qr-article-card__read-toggle"
              onClick={handleToggleRead}
              title={article.isRead ? 'Mark as unread' : 'Mark as read'}
              disabled={disabled}
            >
              <span
                className={`qr-article-card__read-indicator ${
                  article.isRead ? 'qr-article-card__read-indicator--read' : ''
                }`}
              />
            </button>
          )}
          {onToggleStar && (
            <button
              className="qr-article-card__action qr-article-card__star-toggle"
              onClick={handleToggleStar}
              title={article.isStarred ? 'Remove star' : 'Add star'}
              disabled={disabled}
            >
              <span className={`qr-article-card__star ${article.isStarred ? 'qr-article-card__star--starred' : ''}`}>
                ★
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Article Content */}
      {(showSummary || article.content) && (
        <div
          className="qr-article-card__content"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: contentLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {getContentPreview()}
        </div>
      )}

      {/* Article Footer */}
      <div className="qr-article-card__footer">
        <div className="qr-article-card__meta">
          {showSource && feed && (
            <div className="qr-article-card__source">
              {feed.favicon && (
                <img className="qr-article-card__favicon" src={feed.favicon} alt="" width="16" height="16" />
              )}
              <span className="qr-article-card__feed-title">{feed.title}</span>
            </div>
          )}
          {article.author && <span className="qr-article-card__author">by {article.author}</span>}
        </div>
        <time
          className="qr-article-card__date"
          dateTime={article.publishedAt.toISOString()}
          title={article.publishedAt.toLocaleString()}
        >
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </article>
  );
};
