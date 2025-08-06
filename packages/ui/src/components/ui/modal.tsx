import React, { useEffect, useRef } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface ModalProps extends Omit<BaseComponentProps, 'loading' | 'variant'> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscapeKey?: boolean;
  className?: string;
  style?: React.CSSProperties;
  backdropClassName?: string;
  contentClassName?: string;
}

/**
 * Modal component for dialogs and overlays
 * @param isOpen - Whether the modal is visible
 * @param onClose - Callback when modal should be closed
 * @param children - Modal content
 * @param title - Optional modal title/header
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the modal is disabled (prevents closing)
 * @param showCloseButton - Whether to show the X close button
 * @param closeOnBackdropClick - Whether clicking backdrop closes modal
 * @param closeOnEscapeKey - Whether pressing Escape closes modal
 * @param className - Additional CSS classes for modal content
 * @param style - Inline styles for modal content
 * @param backdropClassName - Additional CSS classes for backdrop
 * @param contentClassName - Additional CSS classes for content area
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  disabled = false,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscapeKey = true,
  className = '',
  style,
  backdropClassName = '',
  contentClassName = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscapeKey) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disabled) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, closeOnEscapeKey, disabled, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnBackdropClick && !disabled) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (!disabled) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalClasses = [
    'qr-modal',
    `qr-modal--${size}`,
    disabled && 'qr-modal--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const backdropClasses = [
    'qr-modal__backdrop',
    backdropClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const contentClasses = [
    'qr-modal__content',
    contentClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div 
      className={backdropClasses}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={modalClasses}
        style={style}
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className="qr-modal__header">
            {title && (
              <h2 id="modal-title" className="qr-modal__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="qr-modal__close-button"
                onClick={handleCloseClick}
                aria-label="Close modal"
                disabled={disabled}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
              </button>
            )}
          </div>
        )}
        
        <div className={contentClasses}>
          {children}
        </div>
      </div>
    </div>
  );
};