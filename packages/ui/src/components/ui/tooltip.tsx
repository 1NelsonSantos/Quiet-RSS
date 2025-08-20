import React, { useState, useRef, useEffect } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface TooltipProps extends BaseComponentProps {
  // Tooltip content
  content: string;
  // Child element that triggers the tooltip
  children: React.ReactElement;
  // Position of tooltip relative to trigger
  position?: 'top' | 'bottom' | 'left' | 'right';
  // Delay before showing tooltip (milliseconds)
  delay?: number;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
}

/**
 * Tooltip component that shows contextual information on hover
 * @param content - Text content to display in tooltip
 * @param children - Element that triggers the tooltip
 * @param position - Position relative to trigger (top, bottom, left, right)
 * @param delay - Delay before showing tooltip in milliseconds
 * @param disabled - Whether tooltip is disabled
 * @param className - Additional CSS class names
 * @param style - Inline styles
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
  className = '',
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled || !content.trim()) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const tooltipClasses = [
    'qr-tooltip',
    `qr-tooltip--${position}`,
    isVisible && 'qr-tooltip--visible',
    disabled && 'qr-tooltip--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Clone the trigger element to add event handlers
  const triggerElement = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
    },
  });

  return (
    <div className="qr-tooltip-container" style={style}>
      {triggerElement}
      {content.trim() && (
        <div ref={tooltipRef} className={tooltipClasses} role="tooltip" aria-hidden={!isVisible}>
          {content}
          <div className="qr-tooltip__arrow" />
        </div>
      )}
    </div>
  );
};
