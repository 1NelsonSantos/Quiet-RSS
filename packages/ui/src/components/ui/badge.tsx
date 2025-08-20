import React from 'react';

/**
 * Badge component props interface
 */
export interface BadgeProps {
  // Badge content
  children?: React.ReactNode;
  // Visual variant of the badge (default: 'primary')
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  // Size of the badge (default: 'md')
  size?: 'sm' | 'md' | 'lg';
  // Whether the badge should be displayed as a dot (no content)
  dot?: boolean;
  // Whether the badge should pulse to indicate activity
  pulse?: boolean;
  // Maximum number to display before showing "99+" (default: 99)
  max?: number;
  // Mouse event handlers
  onMouseEnter?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  // Focus event handlers
  onFocus?: (event: React.FocusEvent<HTMLSpanElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSpanElement>) => void;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
}

/**
 * Badge component for displaying small status indicators, counts, and labels
 * @param variant - Visual variant of the badge (primary, secondary, success, warning, danger, info)
 * @param size - Size of the badge (sm, md, lg)
 * @param dot - Whether the badge should be displayed as a dot (no content)
 * @param pulse - Whether the badge should pulse to indicate activity
 * @param max - Maximum number to display before showing "99+"
 * @param children - Badge content (typically a number or short text)
 * @param className - Additional CSS class names
 * @param style - Inline styles
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  pulse = false,
  max = 99,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  className = '',
  style,
}) => {
  // Handle numeric content with max limit
  const getDisplayContent = (): React.ReactNode => {
    if (dot) return null;

    if (typeof children === 'number' && max !== undefined) {
      return children > max ? `${max}+` : children;
    }

    return children;
  };

  const classes = [
    'qr-badge',
    `qr-badge--${variant}`,
    `qr-badge--${size}`,
    dot && 'qr-badge--dot',
    pulse && 'qr-badge--pulse',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const displayContent = getDisplayContent();

  // Don't render if no content and not a dot
  if (!dot && (!displayContent || displayContent === 0)) {
    return null;
  }

  return (
    <span
      className={classes}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      role="status"
      aria-label={dot ? 'Activity indicator' : `Badge: ${displayContent}`}
    >
      {displayContent}
    </span>
  );
};
