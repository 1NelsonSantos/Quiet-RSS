import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface SidebarItem {
  id: string;
  title: string;
  count?: number;
  icon?: string;
  isActive?: boolean;
  color?: string;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
}

export interface SidebarProps extends Omit<BaseComponentProps, 'loading'> {
  // Sidebar sections data
  sections: SidebarSection[];
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // Click handler for navigation items
  onItemClick?: (itemId: string) => void;
  // Handler for section collapse/expand
  onSectionToggle?: (sectionId: string) => void;
  // Whether sidebar is collapsed (mobile)
  isCollapsed?: boolean;
  // Header content (like Add RSS Feed button)
  header?: React.ReactNode;
}

/**
 * Sidebar component for RSS reader navigation
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the sidebar is disabled
 * @param sections - Array of sidebar sections with navigation items
 * @param onItemClick - Click handler for navigation items
 * @param onSectionToggle - Handler for section collapse/expand
 * @param isCollapsed - Whether sidebar is collapsed (mobile)
 * @param header - Header content (like Add RSS Feed button)
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const Sidebar: React.FC<SidebarProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  sections,
  onItemClick,
  onSectionToggle,
  isCollapsed = false,
  header,
  className = '',
  style,
}) => {
  const handleItemClick = (itemId: string) => {
    if (!disabled && onItemClick) {
      onItemClick(itemId);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    if (!disabled && onSectionToggle) {
      onSectionToggle(sectionId);
    }
  };

  const classes = [
    'qr-sidebar',
    `qr-sidebar--${variant}`,
    `qr-sidebar--${size}`,
    isCollapsed && 'qr-sidebar--collapsed',
    disabled && 'qr-sidebar--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={classes} style={style}>
      {header && (
        <div className="qr-sidebar__header">
          {header}
        </div>
      )}

      <nav className="qr-sidebar__nav">
        {sections.map((section) => (
          <div key={section.id} className="qr-sidebar__section">
            <div className="qr-sidebar__section-header">
              <h3 className="qr-sidebar__section-title">{section.title}</h3>
              {section.isCollapsible && (
                <button
                  className={`qr-sidebar__section-toggle ${
                    section.isCollapsed ? 'qr-sidebar__section-toggle--collapsed' : ''
                  }`}
                  onClick={() => handleSectionToggle(section.id)}
                  disabled={disabled}
                  aria-label={section.isCollapsed ? 'Expand section' : 'Collapse section'}
                >
                  <svg
                    className="qr-sidebar__section-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="16"
                    height="16"
                  >
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </button>
              )}
            </div>

            {(!section.isCollapsible || !section.isCollapsed) && (
              <ul className="qr-sidebar__items">
                {section.items.map((item) => (
                  <li key={item.id} className="qr-sidebar__item-wrapper">
                    <button
                      className={`qr-sidebar__item ${
                        item.isActive ? 'qr-sidebar__item--active' : ''
                      }`}
                      onClick={() => handleItemClick(item.id)}
                      disabled={disabled}
                    >
                      {item.icon && (
                        <span 
                          className="qr-sidebar__item-icon"
                          style={{ color: item.color }}
                        >
                          {item.icon}
                        </span>
                      )}
                      {item.color && !item.icon && (
                        <span 
                          className="qr-sidebar__item-dot"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="qr-sidebar__item-title">{item.title}</span>
                      {typeof item.count === 'number' && (
                        <span className="qr-sidebar__item-count">{item.count}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};