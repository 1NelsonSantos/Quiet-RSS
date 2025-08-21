import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface BreadcrumbItem {
  // Unique identifier for the breadcrumb item
  id: string;
  // Display text
  label: string;
  // URL or path for navigation (optional for current page)
  href?: string;
  // Optional icon (can be SVG string or component)
  icon?: React.ReactNode;
  // Whether the item is disabled
  disabled?: boolean;
  // Whether the item is the current page
  current?: boolean;
}

export interface BreadcrumbProps extends Omit<BaseComponentProps, 'loading'> {
  // Array of breadcrumb items
  items: BreadcrumbItem[];
  // Callback when a breadcrumb item is clicked
  onItemClick?: (item: BreadcrumbItem) => void;
  // Custom separator between breadcrumb items
  separator?: React.ReactNode;
  // Whether to show home icon for first item
  showHomeIcon?: boolean;
  // Custom home icon
  homeIcon?: React.ReactNode;
  // Maximum number of items to show before collapsing
  maxItems?: number;
  // Whether to show all items on mobile
  showAllOnMobile?: boolean;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // ARIA label for accessibility
  'aria-label'?: string;
}

/**
 * Breadcrumb navigation component with collapsing and responsive design
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  onItemClick,
  separator,
  showHomeIcon = false,
  homeIcon,
  maxItems,
  showAllOnMobile = false,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style,
  'aria-label': ariaLabel = 'Breadcrumb navigation',
}) => {
  const handleItemClick = (item: BreadcrumbItem, event: React.MouseEvent) => {
    if (item.disabled || item.current) {
      event.preventDefault();
      return;
    }

    onItemClick?.(item);

    // If there's an href and no custom click handler, let the default navigation happen
    if (item.href && !onItemClick) {
      return;
    }

    // Prevent default if we have a custom click handler
    if (onItemClick) {
      event.preventDefault();
    }
  };

  // Collapse items if maxItems is specified and we have more items
  const shouldCollapse = maxItems && items.length > maxItems;
  const visibleItems = shouldCollapse
    ? [
        items[0], // Always show first item (home)
        { id: 'collapsed', label: '...', disabled: true },
        ...items.slice(-(maxItems - 2)), // Show last (maxItems - 2) items
      ]
    : items;

  const breadcrumbClasses = [
    'qr-breadcrumb',
    `qr-breadcrumb--${variant}`,
    `qr-breadcrumb--${size}`,
    disabled && 'qr-breadcrumb--disabled',
    showAllOnMobile && 'qr-breadcrumb--show-all-mobile',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const defaultSeparator = separator || (
    <span className="qr-breadcrumb__separator" aria-hidden="true">
      /
    </span>
  );

  const defaultHomeIcon = homeIcon || (
    <svg className="qr-breadcrumb__home-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z" />
    </svg>
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={breadcrumbClasses} style={style} aria-label={ariaLabel}>
      <ol className="qr-breadcrumb__list" role="list">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const isCollapsed = item.id === 'collapsed';
          const isFirst = index === 0;

          const itemClasses = [
            'qr-breadcrumb__item',
            item.current && 'qr-breadcrumb__item--current',
            item.disabled && 'qr-breadcrumb__item--disabled',
            isCollapsed && 'qr-breadcrumb__item--collapsed',
            isFirst && 'qr-breadcrumb__item--first',
            isLast && 'qr-breadcrumb__item--last',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <li key={item.id} className={itemClasses}>
              {isCollapsed ? (
                <span className="qr-breadcrumb__text" aria-hidden="true">
                  {item.label}
                </span>
              ) : item.href && !item.current && !item.disabled ? (
                <a
                  href={item.href}
                  className="qr-breadcrumb__link"
                  onClick={e => handleItemClick(item, e)}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {isFirst && showHomeIcon && <span className="qr-breadcrumb__icon">{defaultHomeIcon}</span>}
                  {item.icon && !isFirst && <span className="qr-breadcrumb__icon">{item.icon}</span>}
                  <span className="qr-breadcrumb__label">{item.label}</span>
                </a>
              ) : (
                <span
                  className="qr-breadcrumb__text"
                  onClick={item.disabled ? undefined : e => handleItemClick(item, e)}
                  aria-current={item.current ? 'page' : undefined}
                  style={{ cursor: item.disabled ? 'not-allowed' : item.current ? 'default' : 'pointer' }}
                >
                  {isFirst && showHomeIcon && <span className="qr-breadcrumb__icon">{defaultHomeIcon}</span>}
                  {item.icon && !isFirst && <span className="qr-breadcrumb__icon">{item.icon}</span>}
                  <span className="qr-breadcrumb__label">{item.label}</span>
                </span>
              )}

              {!isLast && <span className="qr-breadcrumb__separator-wrapper">{defaultSeparator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
