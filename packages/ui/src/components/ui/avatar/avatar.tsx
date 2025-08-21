import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface AvatarProps extends Omit<BaseComponentProps, 'loading'> {
  // Image source URL
  src?: string;
  // Alternative text for the image
  alt?: string;
  // Fallback initials to display when image fails to load
  initials?: string;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // Click handler
  onClick?: () => void;
  // Whether the avatar should be rounded
  rounded?: boolean;
}

/**
 * Avatar component for displaying user profiles, feed sources, etc.
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the avatar is disabled
 * @param src - Image source URL
 * @param alt - Alternative text for the image
 * @param initials - Fallback initials when image fails to load
 * @param rounded - Whether the avatar should be rounded (default: true)
 * @param onClick - Click handler for interactive avatars
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const Avatar: React.FC<AvatarProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  src,
  alt = '',
  initials,
  rounded = true,
  onClick,
  className = '',
  style,
}) => {
  const [hasImageError, setHasImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(!!src);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasImageError(true);
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const shouldShowImage = src && !hasImageError;
  const shouldShowInitials = !shouldShowImage && initials;

  const classes = [
    'qr-avatar',
    `qr-avatar--${variant}`,
    `qr-avatar--${size}`,
    rounded && 'qr-avatar--rounded',
    onClick && 'qr-avatar--interactive',
    disabled && 'qr-avatar--disabled',
    isLoading && 'qr-avatar--loading',
    !shouldShowImage && 'qr-avatar--fallback',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const avatarProps: React.HTMLAttributes<HTMLDivElement> = {
    className: classes,
    style,
    ...(onClick && {
      onClick: disabled ? undefined : handleClick,
      role: 'button',
      tabIndex: disabled ? -1 : 0,
      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick();
        }
      },
    }),
  };

  return (
    <div {...avatarProps}>
      {shouldShowImage && (
        <img
          className="qr-avatar__image"
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable={false}
        />
      )}
      
      {shouldShowInitials && (
        <span className="qr-avatar__initials">
          {initials.substring(0, 2).toUpperCase()}
        </span>
      )}
      
      {!shouldShowImage && !shouldShowInitials && (
        <div className="qr-avatar__placeholder">
          <svg
            className="qr-avatar__icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="100%"
            height="100%"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )}
      
      {isLoading && (
        <div className="qr-avatar__loader">
          <div className="qr-avatar__spinner"></div>
        </div>
      )}
    </div>
  );
};