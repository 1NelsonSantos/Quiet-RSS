import React, { forwardRef } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface InputProps extends Omit<BaseComponentProps, 'loading'> {
  // Input value
  value?: string;
  // Default value for uncontrolled usage
  defaultValue?: string;
  // Callback when input value changes
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // Callback when input loses focus
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  // Callback when input gains focus
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  // Placeholder text
  placeholder?: string;
  // HTML input type (default: 'text')
  type?: 'text' | 'email' | 'url' | 'password' | 'number' | 'tel' | 'search';
  // HTML id attribute
  id?: string;
  // HTML name attribute for forms
  name?: string;
  // Whether the input is required
  required?: boolean;
  // Whether to auto-focus the input on mount
  autoFocus?: boolean;
  // Whether the input is read-only
  readOnly?: boolean;
  // Maximum length of input
  maxLength?: number;
  // Minimum value (for number inputs)
  min?: number;
  // Maximum value (for number inputs)
  max?: number;
  // Step value (for number inputs)
  step?: number;
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
 * Input component for form fields with validation states and accessibility
 * Supports various input types, validation states, and helper text
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the input is disabled
 * @param state - Validation state (default, error, success, warning)
 * @param value - Input value (controlled)
 * @param defaultValue - Default value for uncontrolled usage
 * @param onChange - Callback when input value changes
 * @param onBlur - Callback when input loses focus
 * @param onFocus - Callback when input gains focus
 * @param placeholder - Placeholder text
 * @param type - HTML input type (text, email, url, password, number, tel, search)
 * @param label - Label text for accessibility and styling
 * @param error - Error message to display
 * @param helperText - Helper text to display
 * @param required - Whether the input is required
 * @param readOnly - Whether the input is read-only
 * @param className - Additional CSS class names
 * @param style - Inline styles
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      state = 'default',
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      type = 'text',
      id,
      name,
      required = false,
      autoFocus = false,
      readOnly = false,
      maxLength,
      min,
      max,
      step,
      error,
      helperText,
      label,
      className = '',
      style,
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = state === 'error' || !!error;
    const finalState = hasError ? 'error' : state;
    const messageText = error || helperText;

    const containerClasses = ['qr-input-container', className].filter(Boolean).join(' ');

    const inputClasses = [
      'qr-input',
      `qr-input--${variant}`,
      `qr-input--${size}`,
      `qr-input--${finalState}`,
      disabled && 'qr-input--disabled',
      readOnly && 'qr-input--readonly',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses} style={style}>
        {label && (
          <label htmlFor={inputId} className="qr-input__label">
            {label}
            {required && (
              <span className="qr-input__required" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          readOnly={readOnly}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={messageText ? `${inputId}-message` : undefined}
        />
        {messageText && (
          <div id={`${inputId}-message`} className={`qr-input__message qr-input__message--${finalState}`}>
            {messageText}
          </div>
        )}
      </div>
    );
  }
);
