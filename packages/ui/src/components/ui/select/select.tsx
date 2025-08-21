import React, { useState, useRef, useEffect } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface SelectOption {
  // Unique identifier for the option
  value: string;
  // Display text
  label: string;
  // Optional icon (can be SVG string or component)
  icon?: React.ReactNode;
  // Whether the option is disabled
  disabled?: boolean;
  // Optional description text
  description?: string;
}

export interface SelectProps extends Omit<BaseComponentProps, 'loading'> {
  // Array of select options
  options: SelectOption[];
  // Currently selected value
  value?: string;
  // Default selected value (for uncontrolled mode)
  defaultValue?: string;
  // Callback when selection changes
  onChange?: (value: string) => void;
  // Placeholder text when no option is selected
  placeholder?: string;
  // Whether the select is searchable (combobox mode)
  searchable?: boolean;
  // Search placeholder text
  searchPlaceholder?: string;
  // Callback for search input changes (for external filtering)
  onSearchChange?: (searchTerm: string) => void;
  // Whether to allow clearing the selection
  clearable?: boolean;
  // Whether multiple selection is allowed
  multiple?: boolean;
  // Maximum number of selections (for multiple mode)
  maxSelections?: number;
  // Custom render function for selected value
  renderValue?: (option: SelectOption | SelectOption[]) => React.ReactNode;
  // Custom render function for options
  renderOption?: (option: SelectOption) => React.ReactNode;
  // Whether dropdown opens upward
  dropdownUp?: boolean;
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
  // Required field indicator
  required?: boolean;
  // Error state
  error?: boolean;
  // Error message
  errorMessage?: string;
}

/**
 * Select/Combobox component with search, multiple selection, and accessibility
 * @param options - Array of select options
 * @param value - Currently selected value(s)
 * @param defaultValue - Default selected value (uncontrolled)
 * @param onChange - Callback when selection changes
 * @param placeholder - Placeholder text when no option is selected
 * @param searchable - Whether the select is searchable (combobox mode)
 * @param searchPlaceholder - Search placeholder text
 * @param onSearchChange - Callback for search input changes
 * @param clearable - Whether to allow clearing the selection
 * @param multiple - Whether multiple selection is allowed
 * @param maxSelections - Maximum number of selections (for multiple mode)
 * @param renderValue - Custom render function for selected value
 * @param renderOption - Custom render function for options
 * @param dropdownUp - Whether dropdown opens upward
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the select is disabled
 * @param className - Additional CSS class names
 * @param style - Inline styles
 * @param id - HTML id attribute
 * @param name - Name attribute for forms
 * @param aria-label - ARIA label for accessibility
 * @param required - Required field indicator
 * @param error - Error state
 * @param errorMessage - Error message
 */
export const Select: React.FC<SelectProps> = ({
  options = [],
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select an option...',
  searchable = false,
  searchPlaceholder = 'Search options...',
  onSearchChange,
  clearable = false,
  multiple = false,
  maxSelections,
  renderValue,
  renderOption,
  dropdownUp = false,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style,
  id,
  name,
  'aria-label': ariaLabel,
  required = false,
  error = false,
  errorMessage,
}) => {
  // Internal state management
  const [internalValue, setInternalValue] = useState<string | string[]>(
    multiple
      ? controlledValue
        ? Array.isArray(controlledValue)
          ? controlledValue
          : [controlledValue]
        : defaultValue
        ? [defaultValue]
        : []
      : controlledValue || defaultValue || ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Refs
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Use controlled value if provided, otherwise use internal state
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const currentValueArray = multiple
    ? Array.isArray(currentValue)
      ? currentValue
      : currentValue
      ? [currentValue as string]
      : []
    : [];

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter(
        option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Available options
  const availableOptions = filteredOptions.filter(option => !option.disabled);

  // Get selected options for display
  const selectedOptions = multiple
    ? options.filter(option => currentValueArray.includes(option.value))
    : options.find(option => option.value === currentValue);

  const handleValueChange = (newValue: string | string[]) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    if (multiple) {
      onChange?.(Array.isArray(newValue) ? newValue.join(',') : (newValue as string));
    } else {
      onChange?.(Array.isArray(newValue) ? newValue[0] || '' : (newValue as string));
    }
  };

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const newValue = [...currentValueArray];
      const optionIndex = newValue.indexOf(option.value);

      if (optionIndex > -1) {
        // Remove option
        newValue.splice(optionIndex, 1);
      } else {
        // Add option (check max selections)
        if (!maxSelections || newValue.length < maxSelections) {
          newValue.push(option.value);
        }
      }

      handleValueChange(newValue);
    } else {
      handleValueChange(option.value);
      setIsOpen(false);
      triggerRef.current?.focus();
    }

    setSearchTerm('');
    setFocusedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleValueChange(multiple ? [] : '');
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setFocusedIndex(-1);
    onSearchChange?.(newSearchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => (prev < availableOptions.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(availableOptions.length - 1);
        } else {
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : availableOptions.length - 1));
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0 && focusedIndex < availableOptions.length) {
          handleOptionSelect(availableOptions[focusedIndex]);
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          setSearchTerm('');
          triggerRef.current?.focus();
        }
        break;

      case 'Backspace':
        if (multiple && currentValueArray.length > 0 && (!searchable || !searchTerm)) {
          e.preventDefault();
          const newValue = [...currentValueArray];
          newValue.pop();
          handleValueChange(newValue);
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const selectClasses = [
    'qr-select',
    `qr-select--${variant}`,
    `qr-select--${size}`,
    isOpen && 'qr-select--open',
    disabled && 'qr-select--disabled',
    error && 'qr-select--error',
    multiple && 'qr-select--multiple',
    searchable && 'qr-select--searchable',
    dropdownUp && 'qr-select--dropdown-up',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClasses = [
    'qr-select__trigger',
    `qr-select__trigger--${variant}`,
    `qr-select__trigger--${size}`,
    isOpen && 'qr-select__trigger--open',
    error && 'qr-select__trigger--error',
  ]
    .filter(Boolean)
    .join(' ');

  const dropdownClasses = [
    'qr-select__dropdown',
    `qr-select__dropdown--${variant}`,
    `qr-select__dropdown--${size}`,
    dropdownUp && 'qr-select__dropdown--up',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={selectClasses} style={style} ref={selectRef}>
      <button
        ref={triggerRef}
        className={triggerClasses}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        aria-required={required}
        aria-invalid={error}
        id={id}
      >
        <div className="qr-select__value">
          {renderValue ? (
            renderValue(selectedOptions as SelectOption | SelectOption[])
          ) : multiple ? (
            currentValueArray.length > 0 ? (
              <div className="qr-select__tags">
                {(selectedOptions as SelectOption[]).map((option: SelectOption) => (
                  <span key={option.value} className="qr-select__tag">
                    {option.icon && <span className="qr-select__tag-icon">{option.icon}</span>}
                    {option.label}
                  </span>
                ))}
              </div>
            ) : (
              <span className="qr-select__placeholder">{placeholder}</span>
            )
          ) : selectedOptions ? (
            <div className="qr-select__single-value">
              {(selectedOptions as SelectOption).icon && (
                <span className="qr-select__value-icon">{(selectedOptions as SelectOption).icon}</span>
              )}
              {(selectedOptions as SelectOption).label}
            </div>
          ) : (
            <span className="qr-select__placeholder">{placeholder}</span>
          )}
        </div>

        <div className="qr-select__indicators">
          {clearable && (multiple ? currentValueArray.length > 0 : currentValue) && (
            <button
              type="button"
              className="qr-select__clear"
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear selection"
            >
              ✕
            </button>
          )}
          <span className={`qr-select__arrow ${isOpen ? 'qr-select__arrow--up' : ''}`}>▼</span>
        </div>
      </button>

      {isOpen && (
        <div className={dropdownClasses} role="listbox" aria-multiselectable={multiple}>
          {searchable && (
            <div className="qr-select__search">
              <input
                ref={searchInputRef}
                type="text"
                className="qr-select__search-input"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <div className="qr-select__options" ref={optionsRef}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const availableIndex = availableOptions.indexOf(option);
                const isFocused = availableIndex === focusedIndex && !option.disabled;
                const isSelected = multiple ? currentValueArray.includes(option.value) : currentValue === option.value;

                return (
                  <div
                    key={option.value}
                    className={[
                      'qr-select__option',
                      isSelected && 'qr-select__option--selected',
                      isFocused && 'qr-select__option--focused',
                      option.disabled && 'qr-select__option--disabled',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <>
                        {multiple && (
                          <span
                            className={`qr-select__option-checkbox ${
                              isSelected ? 'qr-select__option-checkbox--checked' : ''
                            }`}
                          >
                            {isSelected ? '☑' : '☐'}
                          </span>
                        )}
                        {option.icon && <span className="qr-select__option-icon">{option.icon}</span>}
                        <div className="qr-select__option-content">
                          <span className="qr-select__option-label">{option.label}</span>
                          {option.description && (
                            <span className="qr-select__option-description">{option.description}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="qr-select__no-options">No options found</div>
            )}
          </div>
        </div>
      )}

      {/* Hidden native select for form compatibility */}
      <select
        name={name}
        value={multiple ? currentValueArray : (currentValue as string)}
        onChange={() => {}} // Controlled by the component above
        multiple={multiple}
        style={{ display: 'none' }}
        disabled={disabled}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
      >
        {multiple ? (
          currentValueArray.map(val => (
            <option key={val} value={val} selected>
              {options.find(opt => opt.value === val)?.label || val}
            </option>
          ))
        ) : (
          <option value={currentValue as string} selected>
            {selectedOptions ? (selectedOptions as SelectOption).label : ''}
          </option>
        )}
      </select>

      {error && errorMessage && <div className="qr-select__error-message">{errorMessage}</div>}
    </div>
  );
};
