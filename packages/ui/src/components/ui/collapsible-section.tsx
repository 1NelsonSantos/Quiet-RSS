import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface CollapsibleSectionProps extends Omit<BaseComponentProps, 'loading'> {
  // Section title text
  title: string;
  // Whether the section is currently collapsed
  isCollapsed?: boolean;
  // Click handler for toggle button
  onToggle?: () => void;
  // Content to render when expanded
  children: React.ReactNode;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // Custom icon for the toggle (defaults to chevron)
  toggleIcon?: React.ReactNode;
  // Additional content to show in the header (e.g., count badge)
  headerChildren?: React.ReactNode;
}

/**
 * CollapsibleSection component for sections that can be expanded/collapsed
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the section is disabled
 * @param title - Section title text
 * @param isCollapsed - Whether the section is currently collapsed
 * @param onToggle - Click handler for toggle button
 * @param children - Content to render when expanded
 * @param toggleIcon - Custom icon for the toggle (defaults to chevron)
 * @param headerChildren - Additional content to show in the header
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  title,
  isCollapsed = false,
  onToggle,
  children,
  toggleIcon,
  headerChildren,
  className = '',
  style,
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!disabled && onToggle) {
      setIsAnimating(true);
      onToggle();
    }
  };

  React.useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 200); // Match the CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const classes = [
    'qr-collapsible-section',
    `qr-collapsible-section--${variant}`,
    `qr-collapsible-section--${size}`,
    isCollapsed && 'qr-collapsible-section--collapsed',
    isAnimating && 'qr-collapsible-section--animating',
    disabled && 'qr-collapsible-section--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const defaultToggleIcon = (
    <svg
      className="qr-collapsible-section__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
    >
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
    </svg>
  );

  return (
    <div className={classes} style={style}>
      {/* Header */}
      <div 
        className="qr-collapsible-section__header"
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
        aria-expanded={!isCollapsed}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className="qr-collapsible-section__header-content">
          <h3 className="qr-collapsible-section__title">{title}</h3>
          {headerChildren && (
            <div className="qr-collapsible-section__header-children">
              {headerChildren}
            </div>
          )}
        </div>

        <div
          className={`qr-collapsible-section__toggle ${
            isCollapsed ? 'qr-collapsible-section__toggle--collapsed' : ''
          }`}
        >
          {toggleIcon || defaultToggleIcon}
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className={`qr-collapsible-section__content ${
          isCollapsed ? 'qr-collapsible-section__content--collapsed' : 'qr-collapsible-section__content--expanded'
        }`}
      >
        {children}
      </div>
    </div>
  );
};