import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';
import { Avatar } from './avatar';
import { Badge } from './badge';

export interface ListItemProps extends Omit<BaseComponentProps, 'loading'> {
  // Item title/label
  title: string;
  // Optional icon/avatar source
  iconSrc?: string;
  // Avatar fallback initials
  initials?: string;
  // Count/badge number (unread count, total count, etc.)
  count?: number;
  // Whether to show count as badge
  showCount?: boolean;
  // Whether item is currently selected/active
  isActive?: boolean;
  // Click handler
  onClick?: () => void;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
}

/**
 * List Item component for sidebar navigation items (feeds, categories, quick access)
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the item is disabled
 * @param title - Item title/label
 * @param iconSrc - Optional icon/avatar source
 * @param initials - Avatar fallback initials
 * @param count - Count/badge number
 * @param showCount - Whether to show count as badge
 * @param isActive - Whether item is currently selected/active
 * @param onClick - Click handler
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const ListItem: React.FC<ListItemProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  title,
  iconSrc,
  initials,
  count,
  showCount = true,
  isActive = false,
  onClick,
  className = '',
  style,
}) => {
  const classes = [
    'qr-list-item',
    `qr-list-item--${variant}`,
    `qr-list-item--${size}`,
    isActive && 'qr-list-item--active',
    onClick && 'qr-list-item--interactive',
    disabled && 'qr-list-item--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={classes}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {/* Icon/Avatar */}
      {(iconSrc || initials) && (
        <div className="qr-list-item__icon">
          <Avatar
            src={iconSrc}
            initials={initials || title?.charAt(0)?.toUpperCase() || '?'}
            size="sm"
            variant="ghost"
            rounded={true}
          />
        </div>
      )}

      {/* Title */}
      <span className="qr-list-item__title">{title}</span>

      {/* Count Badge */}
      {showCount && count !== undefined && count > 0 && (
        <div className="qr-list-item__count">
          <Badge variant={isActive ? 'primary' : 'secondary'} size="sm">
            {count}
          </Badge>
        </div>
      )}
    </div>
  );
};
