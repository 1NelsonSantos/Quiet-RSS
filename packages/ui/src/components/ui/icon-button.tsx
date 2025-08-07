import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface IconButtonProps extends BaseComponentProps {
  // Icon content
  children: React.ReactNode;
  // Click event handler
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // HTML button type (default: 'button')
  type?: 'button' | 'submit' | 'reset';
  // Accessible label for screen readers (required for icon-only buttons)
  'aria-label': string;
  // Optional tooltip text (displayed on hover)
  title?: string;
  // Whether the button is in an active/pressed state
  active?: boolean;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
}

/**
 * IconButton component for compact actions with icon-only content
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the button is disabled
 * @param loading - Whether the button is in loading state (shows spinner)
 * @param active - Whether the button is in an active/pressed state
 * @param children - Icon content (usually SVG icon or Unicode symbol)
 * @param onClick - Click event handler
 * @param type - HTML button type (button, submit, reset)
 * @param aria-label - Accessible label for screen readers (required)
 * @param title - Optional tooltip text displayed on hover
 * @param className - Additional CSS class names
 * @param style - Inline styles
 */
export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  active = false,
  children,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  title,
  className = '',
  style,
}) => {
  const classes = [
    'qr-icon-button',
    `qr-icon-button--${variant}`,
    `qr-icon-button--${size}`,
    active && 'qr-icon-button--active',
    loading && 'qr-icon-button--loading',
    disabled && 'qr-icon-button--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      style={style}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-pressed={active}
      title={title}
    >
      {loading && <span className="qr-icon-button__spinner" aria-hidden="true" />}
      <span className={`qr-icon-button__icon ${loading ? 'qr-icon-button__icon--hidden' : ''}`}>{children}</span>
    </button>
  );
};
