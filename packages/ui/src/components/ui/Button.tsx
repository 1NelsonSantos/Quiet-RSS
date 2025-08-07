import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface ButtonProps extends BaseComponentProps {
  // Button content
  children: React.ReactNode;
  // Click event handler
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // HTML button type (default: 'button')
  type?: 'button' | 'submit' | 'reset';
  // Whether button should take full width of container
  fullWidth?: boolean;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
}

/**
 * Reusable Button component with variants, sizes, loading states, and accessibility
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the button is disabled
 * @param loading - Whether the button is in loading state (shows spinner)
 * @param fullWidth - Whether button should take full width of container
 * @param children - Button content (text, icons, etc.)
 * @param onClick - Click event handler
 * @param type - HTML button type (button, submit, reset)
 * @param className - Additional CSS class names
 * @param style - Inline styles
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className = '',
  style,
}) => {
  const classes = [
    'qr-button',
    `qr-button--${variant}`,
    `qr-button--${size}`,
    fullWidth && 'qr-button--full-width',
    loading && 'qr-button--loading',
    disabled && 'qr-button--disabled',
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
      aria-busy={loading}
    >
      {loading && <span className="qr-button__spinner" aria-hidden="true" />}
      <span className={`qr-button__content ${loading ? 'qr-button__content--hidden' : ''}`}>{children}</span>
    </button>
  );
};
