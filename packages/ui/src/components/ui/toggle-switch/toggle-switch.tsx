import React from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface ToggleSwitchProps extends Omit<BaseComponentProps, 'loading'> {
  // Whether the toggle is checked/enabled
  checked?: boolean;
  // Callback when toggle state changes
  onChange?: (checked: boolean) => void;
  // Label text for the toggle
  label?: string;
  // Description text shown below the label
  description?: string;
  // Whether to show the label on the left (default) or right
  labelPosition?: 'left' | 'right';
  // Custom icons for checked/unchecked states
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // HTML id attribute
  id?: string;
  // Name attribute for forms
  name?: string;
  // ARIA label for accessibility
  'aria-label'?: string;
  // ARIA description
  'aria-describedby'?: string;
}

/**
 * Toggle Switch component with smooth animations and accessibility
 * @param checked - Whether the toggle is checked/enabled
 * @param onChange - Callback when toggle state changes
 * @param label - Label text for the toggle
 * @param description - Description text shown below the label
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the toggle is disabled
 * @param labelPosition - Whether to show the label on the left (default) or right
 * @param checkedIcon - Custom icon for checked state
 * @param uncheckedIcon - Custom icon for unchecked state
 * @param className - Additional CSS class names
 * @param style - Inline styles
 * @param id - HTML id attribute
 * @param name - Name attribute for forms
 * @param aria-label - ARIA label for accessibility
 * @param aria-describedby - ARIA description
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked = false,
  onChange,
  label,
  description,
  variant = 'primary',
  size = 'md',
  disabled = false,
  labelPosition = 'left',
  checkedIcon,
  uncheckedIcon,
  className = '',
  style,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleToggle();
    }
  };

  const toggleClasses = [
    'qr-toggle-switch',
    `qr-toggle-switch--${variant}`,
    `qr-toggle-switch--${size}`,
    `qr-toggle-switch--label-${labelPosition}`,
    checked && 'qr-toggle-switch--checked',
    disabled && 'qr-toggle-switch--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const switchClasses = [
    'qr-toggle-switch__switch',
    `qr-toggle-switch__switch--${variant}`,
    `qr-toggle-switch__switch--${size}`,
    checked && 'qr-toggle-switch__switch--checked',
  ]
    .filter(Boolean)
    .join(' ');

  const thumbClasses = [
    'qr-toggle-switch__thumb',
    `qr-toggle-switch__thumb--${size}`,
    checked && 'qr-toggle-switch__thumb--checked',
  ]
    .filter(Boolean)
    .join(' ');

  const labelContent = label && (
    <div className="qr-toggle-switch__label-content">
      <span className="qr-toggle-switch__label">{label}</span>
      {description && (
        <span className="qr-toggle-switch__description">{description}</span>
      )}
    </div>
  );

  return (
    <div className={toggleClasses} style={style}>
      {labelPosition === 'left' && labelContent}
      
      <div
        className={switchClasses}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <div className={thumbClasses}>
          {checked && checkedIcon && (
            <span className="qr-toggle-switch__icon qr-toggle-switch__icon--checked">
              {checkedIcon}
            </span>
          )}
          {!checked && uncheckedIcon && (
            <span className="qr-toggle-switch__icon qr-toggle-switch__icon--unchecked">
              {uncheckedIcon}
            </span>
          )}
        </div>
      </div>

      {labelPosition === 'right' && labelContent}

      {/* Hidden input for form compatibility */}
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={() => {}} // Controlled by the div above
        style={{ display: 'none' }}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
};