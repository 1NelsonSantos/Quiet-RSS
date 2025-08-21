import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface EmptyStateProps extends Omit<BaseComponentProps, 'variant' | 'loading'> {
  // Icon to display (optional)
  icon?: React.ReactNode;
  // Main heading text
  heading: string;
  // Descriptive message below heading
  description?: string;
  // Primary action button (optional)
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  // Secondary action button (optional)
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  // Empty state type for styling
  type?: 'default' | 'search' | 'error' | 'loading';
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // HTML id attribute
  id?: string;
}

/**
 * EmptyState component for displaying helpful messages when content is unavailable
 * @param icon - Custom icon to display
 * @param heading - Main heading text
 * @param description - Descriptive message below heading
 * @param primaryAction - Primary action button configuration
 * @param secondaryAction - Secondary action button configuration
 * @param type - Empty state type for styling (default, search, error, loading)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the empty state actions are disabled
 * @param className - Additional CSS class names
 * @param style - Inline styles
 * @param id - HTML id attribute
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  heading,
  description,
  primaryAction,
  secondaryAction,
  type = 'default',
  size = 'md',
  disabled = false,
  className = '',
  style,
  id,
}) => {
  const baseClasses = [
    'qr-empty-state',
    `qr-empty-state--${size}`,
    `qr-empty-state--${type}`,
    disabled && 'qr-empty-state--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const defaultIcons = {
    default: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    search: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    error: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    loading: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
  };

  const displayIcon = icon || defaultIcons[type];

  return (
    <div className={baseClasses} style={style} id={id} role="status" aria-live="polite">
      {displayIcon && (
        <div className="qr-empty-state__icon" aria-hidden="true">
          {displayIcon}
        </div>
      )}
      
      <div className="qr-empty-state__content">
        <h3 className="qr-empty-state__heading">{heading}</h3>
        {description && (
          <p className="qr-empty-state__description">{description}</p>
        )}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="qr-empty-state__actions">
          {primaryAction && (
            <button
              className="qr-empty-state__action qr-empty-state__action--primary"
              onClick={primaryAction.onClick}
              disabled={disabled}
              type="button"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              className="qr-empty-state__action qr-empty-state__action--secondary"
              onClick={secondaryAction.onClick}
              disabled={disabled}
              type="button"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};