import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface RadioOption {
  // Unique value for this option
  value: string;
  // Display label for this option
  label: string;
  // Optional description below the label
  description?: string;
  // Whether this option is disabled
  disabled?: boolean;
  // Custom icon to display with this option
  icon?: React.ReactNode;
}

export interface RadioGroupProps extends Omit<BaseComponentProps, 'loading'> {
  // Currently selected value
  value?: string;
  // Default selected value for uncontrolled usage
  defaultValue?: string;
  // Callback when selection changes
  onChange?: (value: string) => void;
  // Array of radio options
  options: RadioOption[];
  // Group label for accessibility
  label?: string;
  // Group description text
  description?: string;
  // Layout direction
  direction?: 'vertical' | 'horizontal';
  // Whether options are required
  required?: boolean;
  // Error message to display
  error?: string;
  // Helper text to display
  helperText?: string;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // HTML name attribute for the radio group
  name?: string;
  // HTML id attribute for the fieldset
  id?: string;
}

/**
 * RadioGroup component for selecting one option from multiple choices
 * @param value - Currently selected value (controlled)
 * @param defaultValue - Default selected value (uncontrolled)
 * @param onChange - Callback when selection changes
 * @param options - Array of radio options with value, label, description
 * @param label - Group label for accessibility
 * @param description - Group description text
 * @param direction - Layout direction (vertical, horizontal)
 * @param required - Whether selection is required
 * @param error - Error message to display
 * @param helperText - Helper text to display
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether entire group is disabled
 * @param className - Additional CSS classes
 * @param style - Inline styles
 * @param name - HTML name attribute
 * @param id - HTML id attribute
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  value: controlledValue,
  defaultValue,
  onChange,
  options,
  label,
  description,
  direction = 'vertical',
  required = false,
  error,
  helperText,
  size = 'md',
  disabled = false,
  className = '',
  style,
  name,
  id,
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const baseClasses = [
    'qr-radio-group',
    `qr-radio-group--${size}`,
    `qr-radio-group--${direction}`,
    disabled && 'qr-radio-group--disabled',
    error && 'qr-radio-group--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const groupId = id || `qr-radio-group-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;
  const descriptionId = description ? `${groupId}-description` : undefined;
  const radioName = name || groupId;

  const handleChange = (optionValue: string) => {
    if (disabled) {
      return;
    }

    if (!isControlled) {
      setInternalValue(optionValue);
    }

    if (onChange) {
      onChange(optionValue);
    }
  };

  const renderRadioOption = (option: RadioOption, index: number) => {
    const isSelected = currentValue === option.value;
    const isDisabled = disabled || option.disabled;
    const optionId = `${groupId}-option-${index}`;

    const optionClasses = [
      'qr-radio-option',
      `qr-radio-option--${size}`,
      isSelected && 'qr-radio-option--selected',
      isDisabled && 'qr-radio-option--disabled',
      option.icon && 'qr-radio-option--with-icon',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label key={option.value} className={optionClasses} htmlFor={optionId}>
        <input
          type="radio"
          id={optionId}
          name={radioName}
          value={option.value}
          checked={isSelected}
          onChange={() => handleChange(option.value)}
          disabled={isDisabled}
          className="qr-radio-option__input"
          aria-describedby={
            [option.description ? `${optionId}-description` : '', descriptionId, helperId, errorId]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />

        <div className="qr-radio-option__indicator">
          <div className="qr-radio-option__indicator-inner" />
        </div>

        <div className="qr-radio-option__content">
          {option.icon && (
            <div className="qr-radio-option__icon" aria-hidden="true">
              {option.icon}
            </div>
          )}

          <div className="qr-radio-option__text">
            <span className="qr-radio-option__label">{option.label}</span>
            {option.description && (
              <span className="qr-radio-option__description" id={`${optionId}-description`}>
                {option.description}
              </span>
            )}
          </div>
        </div>
      </label>
    );
  };

  return (
    <fieldset className={baseClasses} style={style} id={groupId}>
      {label && (
        <legend className="qr-radio-group__legend">
          {label}
          {required && <span className="qr-radio-group__required">*</span>}
        </legend>
      )}

      {description && (
        <div className="qr-radio-group__description" id={descriptionId}>
          {description}
        </div>
      )}

      <div className="qr-radio-group__options" role="radiogroup">
        {options.map((option, index) => renderRadioOption(option, index))}
      </div>

      {error && (
        <div className="qr-radio-group__error" id={errorId} role="alert">
          {error}
        </div>
      )}

      {helperText && !error && (
        <div className="qr-radio-group__helper" id={helperId}>
          {helperText}
        </div>
      )}
    </fieldset>
  );
};
