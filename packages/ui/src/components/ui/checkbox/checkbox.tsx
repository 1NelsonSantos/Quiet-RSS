import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface CheckboxProps extends Omit<BaseComponentProps, 'loading'> {
  // Whether the checkbox is checked
  checked?: boolean;
  // Indeterminate state (partially checked)
  indeterminate?: boolean;
  // Callback when checkbox state changes
  onChange?: (checked: boolean) => void;
  // Label text for the checkbox
  label?: string;
  // Description text shown below the label
  description?: string;
  // Whether to show the label on the left (default) or right
  labelPosition?: 'left' | 'right';
  // Custom icon for checked state
  checkedIcon?: React.ReactNode;
  // Custom icon for indeterminate state
  indeterminateIcon?: React.ReactNode;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // HTML id attribute
  id?: string;
  // Name attribute for forms
  name?: string;
  // Value attribute for forms
  value?: string;
  // ARIA label for accessibility
  'aria-label'?: string;
  // ARIA description
  'aria-describedby'?: string;
  // Required field indicator
  required?: boolean;
}

/**
 * Checkbox component with smooth animations and accessibility
 * @param checked - Whether the checkbox is checked
 * @param indeterminate - Indeterminate state (partially checked)
 * @param onChange - Callback when checkbox state changes
 * @param label - Label text for the checkbox
 * @param description - Description text shown below the label
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the checkbox is disabled
 * @param labelPosition - Whether to show the label on the left (default) or right
 * @param checkedIcon - Custom icon for checked state
 * @param indeterminateIcon - Custom icon for indeterminate state
 * @param className - Additional CSS class names
 * @param style - Inline styles
 * @param id - HTML id attribute
 * @param name - Name attribute for forms
 * @param value - Value attribute for forms
 * @param aria-label - ARIA label for accessibility
 * @param aria-describedby - ARIA description
 * @param required - Required field indicator
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  description,
  variant = 'primary',
  size = 'md',
  disabled = false,
  labelPosition = 'right',
  checkedIcon,
  indeterminateIcon,
  className = '',
  style,
  id,
  name,
  value,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  required = false,
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      handleChange();
    }
  };

  const checkboxClasses = [
    'qr-checkbox',
    `qr-checkbox--${variant}`,
    `qr-checkbox--${size}`,
    `qr-checkbox--label-${labelPosition}`,
    checked && 'qr-checkbox--checked',
    indeterminate && 'qr-checkbox--indeterminate',
    disabled && 'qr-checkbox--disabled',
    required && 'qr-checkbox--required',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [
    'qr-checkbox__input',
    `qr-checkbox__input--${variant}`,
    `qr-checkbox__input--${size}`,
    checked && 'qr-checkbox__input--checked',
    indeterminate && 'qr-checkbox__input--indeterminate',
  ]
    .filter(Boolean)
    .join(' ');

  const labelContent = label && (
    <div className="qr-checkbox__label-content">
      <span className="qr-checkbox__label">
        {label}
        {required && <span className="qr-checkbox__required">*</span>}
      </span>
      {description && (
        <span className="qr-checkbox__description">{description}</span>
      )}
    </div>
  );

  // Determine the current state for accessibility and styling
  const currentState = indeterminate ? 'mixed' : checked;

  return (
    <div className={checkboxClasses} style={style}>
      {labelPosition === 'left' && labelContent}
      
      <div className="qr-checkbox__input-wrapper">
        <div
          className={inputClasses}
          role="checkbox"
          aria-checked={currentState}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy}
          aria-required={required}
          tabIndex={disabled ? -1 : 0}
          onClick={handleChange}
          onKeyDown={handleKeyDown}
        >
          {/* Check mark or custom icon */}
          <div className="qr-checkbox__icon">
            {indeterminate ? (
              indeterminateIcon || (
                <svg
                  className="qr-checkbox__icon-indeterminate"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="2" y="7" width="12" height="2" rx="1" />
                </svg>
              )
            ) : checked ? (
              checkedIcon || (
                <svg
                  className="qr-checkbox__icon-check"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L7 9.586l4.293-4.293a1 1 0 0 1 1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )
            ) : null}
          </div>
        </div>

        {/* Hidden native input for form compatibility */}
        <input
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => {}} // Controlled by the div above
          style={{ display: 'none' }}
          disabled={disabled}
          required={required}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {labelPosition === 'right' && labelContent}
    </div>
  );
};