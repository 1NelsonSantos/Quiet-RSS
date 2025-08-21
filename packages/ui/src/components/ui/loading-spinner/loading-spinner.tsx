import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface LoadingSpinnerProps extends Omit<BaseComponentProps, 'loading'> {
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // Animation type (default: 'spinner')
  type?: 'spinner' | 'dots' | 'bars';
  // Accessible label for screen readers (default: 'Loading')
  label?: string;
}

/**
 * LoadingSpinner component for async operations and loading states
 * Provides three different animation types with accessibility support
 * @param variant - Color variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the spinner is disabled (reduces opacity)
 * @param type - Animation type (spinner, dots, bars)
 * @param label - Accessible label for screen readers
 * @param className - Additional CSS class names
 * @param style - Inline styles
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'spinner',
  label = 'Loading...',
  className = '',
  style,
}) => {
  const classes = [
    'qr-loading-spinner',
    `qr-loading-spinner--${variant}`,
    `qr-loading-spinner--${size}`,
    `qr-loading-spinner--${type}`,
    disabled && 'qr-loading-spinner--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="qr-loading-spinner__dots">
            <div className="qr-loading-spinner__dot"></div>
            <div className="qr-loading-spinner__dot"></div>
            <div className="qr-loading-spinner__dot"></div>
          </div>
        );
      
      case 'bars':
        return (
          <div className="qr-loading-spinner__bars">
            <div className="qr-loading-spinner__bar"></div>
            <div className="qr-loading-spinner__bar"></div>
            <div className="qr-loading-spinner__bar"></div>
            <div className="qr-loading-spinner__bar"></div>
          </div>
        );
      
      case 'spinner':
      default:
        return (
          <svg 
            className="qr-loading-spinner__svg" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <circle
              className="qr-loading-spinner__circle-bg"
              cx="12"
              cy="12"
              r="10"
              strokeWidth="2"
            />
            <circle
              className="qr-loading-spinner__circle"
              cx="12"
              cy="12"
              r="10"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="62.83"
              strokeDashoffset="62.83"
            />
          </svg>
        );
    }
  };

  return (
    <div 
      className={classes}
      style={style}
      role="status" 
      aria-label={label}
    >
      {renderSpinner()}
      <span className="qr-loading-spinner__label">
        {label}
      </span>
    </div>
  );
};