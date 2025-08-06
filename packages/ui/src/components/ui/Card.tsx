import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface CardProps extends Omit<BaseComponentProps, 'loading'> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}

/**
 * Reusable Card component for content containers
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg) 
 * @param disabled - Whether the card is disabled
 * @param padding - Internal padding (none, sm, md, lg)
 * @param shadow - Drop shadow depth (none, sm, md, lg)
 * @param border - Whether to show border
 * @param hover - Whether to show hover effects
 * @param onClick - Click handler (makes card interactive)
 * @param children - Card content
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const Card: React.FC<CardProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  onClick,
  children,
  className = '',
  style,
}) => {
  const isInteractive = !!onClick;
  
  const classes = [
    'qr-card',
    `qr-card--${variant}`,
    `qr-card--${size}`,
    `qr-card--padding-${padding}`,
    `qr-card--shadow-${shadow}`,
    border && 'qr-card--border',
    hover && 'qr-card--hover',
    isInteractive && 'qr-card--interactive',
    disabled && 'qr-card--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cardProps: React.HTMLAttributes<HTMLDivElement> = {
    className: classes,
    style,
    ...(isInteractive && {
      onClick: disabled ? undefined : onClick,
      role: 'button',
      tabIndex: disabled ? -1 : 0,
      onKeyDown: (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          e.preventDefault();
          onClick(e as any);
        }
      },
    }),
  };

  return <div {...cardProps}>{children}</div>;
};