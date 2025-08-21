import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface HeaderProps extends Omit<BaseComponentProps, 'loading'> {
  // App title/logo text
  title?: string;
  // Logo image source
  logoSrc?: string;
  // Search bar props
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  // Notification count
  notificationCount?: number;
  onNotificationClick?: () => void;
  // Settings handler
  onSettingsClick?: () => void;
  // User avatar props
  userAvatar?: {
    src?: string;
    initials?: string;
    alt?: string;
  };
  onUserAvatarClick?: () => void;
  // Additional action buttons
  actions?: React.ReactNode;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // Mobile menu toggle (for responsive)
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

/**
 * Header component for app navigation and user actions
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the header is disabled
 * @param title - App title/logo text
 * @param logoSrc - Logo image source
 * @param searchPlaceholder - Search bar placeholder text
 * @param searchValue - Current search value
 * @param onSearchChange - Search input change handler
 * @param onSearchSubmit - Search submit handler
 * @param notificationCount - Number of notifications
 * @param onNotificationClick - Notification bell click handler
 * @param onSettingsClick - Settings icon click handler
 * @param userAvatar - User avatar configuration
 * @param onUserAvatarClick - User avatar click handler
 * @param actions - Additional action buttons
 * @param onMenuToggle - Mobile menu toggle handler
 * @param isMenuOpen - Whether mobile menu is open
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const Header: React.FC<HeaderProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  title = 'FeedReader Pro',
  logoSrc,
  searchPlaceholder = 'Search feeds and articles...',
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  notificationCount = 0,
  onNotificationClick,
  onSettingsClick,
  userAvatar,
  onUserAvatarClick,
  actions,
  onMenuToggle,
  isMenuOpen = false,
  className = '',
  style,
}) => {
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit(searchValue);
    }
  };

  const classes = [
    'qr-header',
    `qr-header--${variant}`,
    `qr-header--${size}`,
    disabled && 'qr-header--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={classes} style={style}>
      {/* Left Section - Logo & Title */}
      <div className="qr-header__left">
        {/* Mobile Menu Toggle */}
        {onMenuToggle && (
          <button
            className={`qr-header__menu-toggle ${isMenuOpen ? 'qr-header__menu-toggle--open' : ''}`}
            onClick={onMenuToggle}
            disabled={disabled}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg
              className="qr-header__menu-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              {isMenuOpen ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              ) : (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              )}
            </svg>
          </button>
        )}

        {/* Logo & Title */}
        <div className="qr-header__brand">
          {logoSrc && (
            <img
              className="qr-header__logo"
              src={logoSrc}
              alt={title}
              width="24"
              height="24"
            />
          )}
          <h1 className="qr-header__title">{title}</h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="qr-header__center">
        <div className="qr-header__search">
          <div className="qr-header__search-icon">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width="16"
              height="16"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <input
            className="qr-header__search-input"
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="qr-header__right">
        {/* Custom Actions */}
        {actions && (
          <div className="qr-header__actions">
            {actions}
          </div>
        )}

        {/* Settings */}
        {onSettingsClick && (
          <button
            className="qr-header__action-button"
            onClick={onSettingsClick}
            disabled={disabled}
            title="Settings"
          >
            <svg
              className="qr-header__action-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>
        )}

        {/* Notifications */}
        {onNotificationClick && (
          <button
            className="qr-header__action-button qr-header__notification-button"
            onClick={onNotificationClick}
            disabled={disabled}
            title="Notifications"
          >
            <svg
              className="qr-header__action-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            {notificationCount > 0 && (
              <span className="qr-header__notification-badge">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        )}

        {/* User Avatar */}
        {userAvatar && (
          <button
            className="qr-header__user-button"
            onClick={onUserAvatarClick}
            disabled={disabled}
            title="User menu"
          >
            <div className="qr-header__avatar">
              {userAvatar.src ? (
                <img
                  className="qr-header__avatar-image"
                  src={userAvatar.src}
                  alt={userAvatar.alt || 'User avatar'}
                  width="32"
                  height="32"
                />
              ) : (
                <div className="qr-header__avatar-fallback">
                  {userAvatar.initials || 'U'}
                </div>
              )}
            </div>
          </button>
        )}
      </div>
    </header>
  );
};