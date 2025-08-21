import React, { useState, useEffect } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';
import { Header, HeaderProps } from './header';
import { Sidebar, SidebarProps, SidebarSection } from './sidebar';

export interface AppLayoutProps extends Omit<BaseComponentProps, 'loading'> {
  // Header configuration
  headerProps?: Partial<HeaderProps>;

  // Sidebar configuration
  sidebarSections: SidebarSection[];
  onNavigationChange?: (itemId: string) => void;
  onSectionToggle?: (sectionId: string) => void;

  // Article list (left panel)
  articleList?: React.ReactNode;
  articleListWidth?: string;

  // Article detail (main content)
  articleDetail?: React.ReactNode;

  // Right panel (optional)
  rightPanel?: React.ReactNode;
  rightPanelWidth?: string;

  // Layout control
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;

  // Responsive configuration
  mobileBreakpoint?: number;
  forceMobile?: boolean;

  // Sidebar header content
  sidebarHeader?: React.ReactNode;

  // Additional customization
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AppLayout component - Main application layout container
 *
 * Manages the ui with responsive design:
 * - Desktop: Fixed sidebar + header with main content area
 * - Mobile: Collapsible sidebar overlay with responsive header
 *
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the layout is disabled
 * @param headerProps - Props to pass to the Header component
 * @param sidebarSections - Array of sidebar sections with navigation items
 * @param onNavigationChange - Handler for sidebar navigation clicks
 * @param onSectionToggle - Handler for sidebar section collapse/expand
 * @param articleList - Article list component for left panel
 * @param articleListWidth - Width of article list panel (default: 400px)
 * @param articleDetail - Article detail component for main content area
 * @param rightPanel - Optional right panel content
 * @param rightPanelWidth - Width of right panel (default: 60px)
 * @param sidebarCollapsed - Whether sidebar is collapsed (controlled)
 * @param onSidebarToggle - Handler for sidebar toggle (mobile menu)
 * @param mobileBreakpoint - Breakpoint width for mobile layout (default: 768px)
 * @param forceMobile - Force mobile layout regardless of screen size
 * @param sidebarHeader - Content to show in sidebar header
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  headerProps = {},
  sidebarSections,
  onNavigationChange,
  onSectionToggle,
  articleList,
  articleListWidth = '400px',
  articleDetail,
  rightPanel,
  rightPanelWidth = '60px',
  sidebarCollapsed: controlledCollapsed,
  onSidebarToggle,
  mobileBreakpoint = 768,
  forceMobile = false,
  sidebarHeader,
  className = '',
  style,
}) => {
  // Internal state for sidebar collapse when not controlled
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Use controlled or internal collapsed state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  // Handle responsive breakpoint
  useEffect(() => {
    if (forceMobile) {
      setIsMobileView(true);
      return;
    }

    const checkMobile = () => {
      const mobile = window.innerWidth <= mobileBreakpoint;
      setIsMobileView(mobile);

      // Auto-collapse sidebar on mobile
      if (mobile && controlledCollapsed === undefined) {
        setInternalCollapsed(true);
      }
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint, forceMobile, controlledCollapsed]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (onSidebarToggle) {
      onSidebarToggle();
    } else {
      setInternalCollapsed(!isCollapsed);
    }
  };

  // Handle mobile overlay click (close sidebar)
  const handleOverlayClick = () => {
    if (isMobileView) {
      handleSidebarToggle();
    }
  };

  // Build CSS classes
  const classes = [
    'qr-app-layout',
    `qr-app-layout--${variant}`,
    `qr-app-layout--${size}`,
    isMobileView && 'qr-app-layout--mobile',
    isCollapsed && 'qr-app-layout--sidebar-collapsed',
    disabled && 'qr-app-layout--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Header props with mobile menu toggle
  const enhancedHeaderProps: HeaderProps = {
    ...headerProps,
    onMenuToggle: handleSidebarToggle,
    isMenuOpen: !isCollapsed,
    variant,
    size,
    disabled,
  };

  // Sidebar props
  const enhancedSidebarProps: SidebarProps = {
    sections: sidebarSections,
    onItemClick: onNavigationChange,
    onSectionToggle,
    isCollapsed,
    header: sidebarHeader,
    variant,
    size,
    disabled,
  };

  return (
    <div
      className={classes}
      style={
        {
          ...style,
          '--qr-app-layout-article-list-width': articleListWidth,
          '--qr-app-layout-right-panel-width': rightPanel ? rightPanelWidth : '0px',
        } as React.CSSProperties
      }
    >
      {/* Mobile Overlay */}
      {isMobileView && !isCollapsed && (
        <div className="qr-app-layout__overlay" onClick={handleOverlayClick} aria-hidden="true" />
      )}

      {/* Header */}
      <header className="qr-app-layout__header">
        <Header {...enhancedHeaderProps} />
      </header>

      {/* Sidebar */}
      <aside className="qr-app-layout__sidebar">
        <Sidebar {...enhancedSidebarProps} />
      </aside>

      {/* Article List Panel */}
      <section className="qr-app-layout__article-list">{articleList}</section>

      {/* Article Detail (Main Content) */}
      <main className="qr-app-layout__article-detail" role="main">
        {articleDetail}
      </main>

      {/* Right Panel (Optional) */}
      {rightPanel && <aside className="qr-app-layout__right-panel">{rightPanel}</aside>}
    </div>
  );
};
