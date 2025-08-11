import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface AlertProps extends Omit<BaseComponentProps, 'loading'> {
  // Alert content
  children: React.ReactNode;
  // Alert title (optional)
  title?: string;
  // Icon to display (optional)
  icon?: React.ReactNode;
  // Whether alert can be dismissed
  dismissible?: boolean;
  // Callback when alert is dismissed
  onDismiss?: () => void;
  // Whether to show default icons for each variant
  showIcon?: boolean;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // HTML id attribute
  id?: string;
  // ARIA role override
  role?: string;
}

/**
 * Alert component for displaying important messages to users
 * @param children - Alert content
 * @param title - Optional alert title
 * @param icon - Custom icon to display
 * @param dismissible - Whether alert can be dismissed
 * @param onDismiss - Callback when alert is dismissed
 * @param showIcon - Whether to show default icons for each variant
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the alert is disabled
 * @param className - Additional CSS class names
 * @param style - Inline styles
 * @param id - HTML id attribute
 * @param role - ARIA role override
 */
export const Alert: React.FC<AlertProps> = ({
  children,
  title,
  icon,
  dismissible = false,
  onDismiss,
  showIcon = true,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style,
  id,
  role = 'alert',
}) => {
  const handleDismiss = () => {
    onDismiss?.();
  };

  const getDefaultIcon = () => {
    if (!showIcon || icon !== undefined) return null;

    switch (variant) {
      case 'primary':
        return (
          <svg viewBox="0 0 20 20" fill="currentColor" className="qr-alert__default-icon">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'secondary':
        return (
          <svg viewBox="0 0 20 20" fill="currentColor" className="qr-alert__default-icon">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'danger':
        return (
          <svg viewBox="0 0 20 20" fill="currentColor" className="qr-alert__default-icon">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'ghost':
        return (
          <svg viewBox="0 0 20 20" fill="currentColor" className="qr-alert__default-icon">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const alertClasses = [
    'qr-alert',
    `qr-alert--${variant}`,
    `qr-alert--${size}`,
    disabled && 'qr-alert--disabled',
    dismissible && 'qr-alert--dismissible',
    (icon || showIcon) && 'qr-alert--with-icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={alertClasses} style={style} id={id} role={role} aria-live={role === 'alert' ? 'polite' : undefined}>
      {(icon || showIcon) && <div className="qr-alert__icon">{icon || getDefaultIcon()}</div>}

      <div className="qr-alert__content">
        {title && <div className="qr-alert__title">{title}</div>}
        <div className="qr-alert__message">{children}</div>
      </div>

      {dismissible && (
        <button type="button" className="qr-alert__dismiss" onClick={handleDismiss} aria-label="Dismiss alert">
          <svg viewBox="0 0 20 20" fill="currentColor" className="qr-alert__dismiss-icon">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
