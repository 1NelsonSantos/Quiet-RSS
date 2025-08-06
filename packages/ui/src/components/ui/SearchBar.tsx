import React, { useState } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface SearchBarProps extends Omit<BaseComponentProps, 'loading' | 'variant'> {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  clearable?: boolean;
}

/**
 * SearchBar component for filtering and searching content
 * @param value - Current search value (controlled)
 * @param onChange - Callback when input value changes
 * @param onSearch - Callback when search is performed (Enter key or search button)
 * @param onClear - Callback when clear button is clicked
 * @param placeholder - Placeholder text for the input
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the search bar is disabled
 * @param autoFocus - Whether to auto-focus the input on mount
 * @param clearable - Whether to show clear button when there's text
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  size = 'md',
  disabled = false,
  autoFocus = false,
  clearable = true,
  className = '',
  style,
}) => {
  const [internalValue, setInternalValue] = useState('');
  
  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const isControlled = controlledValue !== undefined;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch?.(value);
    }
  };

  const handleClear = () => {
    const newValue = '';
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onClear?.();
  };

  const handleSearchClick = () => {
    onSearch?.(value);
  };

  const showClearButton = clearable && value.length > 0 && !disabled;

  const classes = [
    'qr-search-bar',
    `qr-search-bar--${size}`,
    disabled && 'qr-search-bar--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      <div className="qr-search-bar__icon qr-search-bar__icon--search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </div>
      
      <input
        type="text"
        className="qr-search-bar__input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label="Search"
      />
      
      {showClearButton && (
        <button
          type="button"
          className="qr-search-bar__icon qr-search-bar__icon--clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      )}
    </div>
  );
};