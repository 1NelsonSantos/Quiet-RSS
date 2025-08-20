import React, { forwardRef } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface TextAreaProps extends Omit<BaseComponentProps, 'loading'> {
  // TextArea value
  value?: string;
  // Default value for uncontrolled usage
  defaultValue?: string;
  // Callback when textarea value changes
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  // Callback when textarea loses focus
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  // Callback when textarea gains focus
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  // Placeholder text
  placeholder?: string;
  // HTML id attribute
  id?: string;
  // HTML name attribute for forms
  name?: string;
  // Whether the textarea is required
  required?: boolean;
  // Whether to auto-focus the textarea on mount
  autoFocus?: boolean;
  // Whether the textarea is read-only
  readOnly?: boolean;
  // Maximum length of text
  maxLength?: number;
  // Minimum length of text
  minLength?: number;
  // Number of visible text lines
  rows?: number;
  // Number of visible text columns
  cols?: number;
  // How text wraps
  wrap?: 'soft' | 'hard' | 'off';
  // Whether textarea auto-resizes to content
  autoResize?: boolean;
  // Validation state (affects styling)
  state?: 'default' | 'error' | 'success' | 'warning';
  // Error message to display
  error?: string;
  // Helper text to display
  helperText?: string;
  // Label text (for accessibility and styling)
  label?: string;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
}

/**
 * TextArea component for multi-line text input
 * Useful for feed descriptions, notes, OPML import/export, custom styles
 * @param value - Current value (controlled)
 * @param defaultValue - Default value (uncontrolled)
 * @param onChange - Callback when value changes
 * @param onBlur - Callback when textarea loses focus
 * @param onFocus - Callback when textarea gains focus
 * @param placeholder - Placeholder text
 * @param rows - Number of visible text lines (default: 4)
 * @param cols - Number of visible text columns
 * @param wrap - How text wraps (soft, hard, off)
 * @param autoResize - Whether textarea auto-resizes to content
 * @param state - Validation state (default, error, success, warning)
 * @param error - Error message to display
 * @param helperText - Helper text to display
 * @param label - Label text
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether textarea is disabled
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      id,
      name,
      required = false,
      autoFocus = false,
      readOnly = false,
      maxLength,
      minLength,
      rows = 4,
      cols,
      wrap = 'soft',
      autoResize = false,
      state = 'default',
      error,
      helperText,
      label,
      size = 'md',
      disabled = false,
      className = '',
      style,
    },
    ref
  ) => {
    const baseClasses = [
      'qr-textarea',
      `qr-textarea--${size}`,
      `qr-textarea--${state}`,
      disabled && 'qr-textarea--disabled',
      readOnly && 'qr-textarea--readonly',
      autoResize && 'qr-textarea--auto-resize',
      error && 'qr-textarea--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaId = id || `qr-textarea-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;

    // Character count logic
    const currentLength = value?.length || 0;
    const showCount = maxLength && maxLength > 0;
    const isNearLimit = maxLength && currentLength >= maxLength * 0.8;
    const isOverLimit = maxLength && currentLength > maxLength;

    const getCountClass = () => {
      if (isOverLimit) {
        return 'qr-textarea__count-overlay--error';
      }
      if (isNearLimit) {
        return 'qr-textarea__count-overlay--warning';
      }

      return '';
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        // Auto-resize textarea to fit content
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }

      if (onChange) {
        onChange(event);
      }
    };

    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        // Ensure proper height on focus
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }

      if (onFocus) {
        onFocus(event);
      }
    };

    return (
      <div className="qr-textarea-container">
        {label && (
          <label className="qr-textarea__label" htmlFor={textareaId}>
            {label}
            {required && <span className="qr-textarea__required">*</span>}
          </label>
        )}

        <div className="qr-textarea__wrapper">
          <textarea
            ref={ref}
            className={baseClasses}
            style={style}
            id={textareaId}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            readOnly={readOnly}
            disabled={disabled}
            maxLength={maxLength}
            minLength={minLength}
            rows={rows}
            cols={cols}
            wrap={wrap}
            aria-invalid={state === 'error' || !!error}
            aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
          />

          {showCount && (
            <div className={`qr-textarea__count-overlay ${getCountClass()}`}>
              {currentLength}
              {maxLength && `/${maxLength}`}
            </div>
          )}
        </div>

        {error && (
          <div className="qr-textarea__error" id={errorId} role="alert">
            {error}
          </div>
        )}

        {helperText && !error && (
          <div className="qr-textarea__helper" id={helperId}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
