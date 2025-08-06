import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface ButtonProps extends BaseComponentProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

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
      <span className={`qr-button__content ${loading ? 'qr-button__content--hidden' : ''}`}>
        {children}
      </span>
    </button>
  );
};