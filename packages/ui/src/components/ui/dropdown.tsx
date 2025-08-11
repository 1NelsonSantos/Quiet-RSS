import React, { useState, useRef, useEffect } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface DropdownOption {
  // Unique identifier for the option
  id: string;
  // Display text
  label: string;
  // Optional icon (can be SVG string or component)
  icon?: React.ReactNode;
  // Whether the option is disabled
  disabled?: boolean;
  // Whether the option is destructive (like delete)
  destructive?: boolean;
  // Optional divider after this option
  divider?: boolean;
}

export interface DropdownProps extends Omit<BaseComponentProps, 'loading'> {
  // Array of dropdown options
  options: DropdownOption[];
  // Callback when option is selected
  onSelect?: (option: DropdownOption) => void;
  // Trigger element (must be a React element like Button, IconButton, etc.)
  trigger: React.ReactElement;
  // Placement of dropdown relative to trigger
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'bottom' | 'top';
  // Whether dropdown is controlled open/closed
  open?: boolean;
  // Callback when open state changes (for controlled mode)
  onOpenChange?: (open: boolean) => void;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // Whether to close on option select (default: true)
  closeOnSelect?: boolean;
  // Custom width for dropdown menu
  menuWidth?: number | string;
}

/**
 * Dropdown component with keyboard navigation and accessibility
 * @param options - Array of dropdown options with labels, icons, and actions
 * @param onSelect - Callback when option is selected
 * @param trigger - React element that triggers the dropdown (Button, IconButton, etc.)
 * @param placement - Position of dropdown relative to trigger
 * @param variant - Visual style variant (primary, secondary, ghost, danger)
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether the dropdown is disabled
 * @param open - Whether dropdown is controlled open/closed
 * @param onOpenChange - Callback when open state changes
 * @param closeOnSelect - Whether to close dropdown when option is selected
 * @param menuWidth - Custom width for dropdown menu
 * @param className - Additional CSS class names
 * @param style - Inline styles
 */
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  trigger,
  placement = 'bottom-start',
  variant = 'primary',
  size = 'md',
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  closeOnSelect = true,
  menuWidth,
  className = '',
  style,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerWrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const isControlled = controlledOpen !== undefined;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);

    if (!newOpen) {
      setFocusedIndex(-1);
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      handleOpenChange(!isOpen);
    }
  };

  const handleOptionSelect = (option: DropdownOption) => {
    if (option.disabled) return;

    onSelect?.(option);

    if (closeOnSelect) {
      handleOpenChange(false);
      // Focus the first focusable element in the trigger wrapper
      const focusableElement = triggerWrapperRef.current?.querySelector(
        'button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      focusableElement?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        handleOpenChange(true);
        setFocusedIndex(0);
      }
      return;
    }

    const availableOptions = options.filter(option => !option.disabled);

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        handleOpenChange(false);
        // Focus the first focusable element in the trigger wrapper
        const focusableElement = triggerWrapperRef.current?.querySelector(
          'button, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        focusableElement?.focus();
        break;

      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex >= availableOptions.length ? 0 : nextIndex;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev - 1;
          return nextIndex < 0 ? availableOptions.length - 1 : nextIndex;
        });
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < availableOptions.length) {
          handleOptionSelect(availableOptions[focusedIndex]);
        }
        break;

      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setFocusedIndex(availableOptions.length - 1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])');
      const targetItem = menuItems?.[focusedIndex] as HTMLElement;
      targetItem?.focus();
    }
  }, [isOpen, focusedIndex]);

  const dropdownClasses = [
    'qr-dropdown',
    `qr-dropdown--${variant}`,
    `qr-dropdown--${size}`,
    `qr-dropdown--placement-${placement}`,
    isOpen && 'qr-dropdown--open',
    disabled && 'qr-dropdown--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const menuClasses = ['qr-dropdown__menu', `qr-dropdown__menu--${variant}`, `qr-dropdown__menu--${size}`]
    .filter(Boolean)
    .join(' ');

  const menuStyle: React.CSSProperties = {
    ...(menuWidth && { width: menuWidth }),
  };

  // Clone the trigger element and add dropdown props
  const triggerElement = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      // Call original onClick if it exists
      const originalOnClick = trigger.props.onClick;
      if (originalOnClick) {
        originalOnClick(e);
      }
      if (!disabled) {
        handleTriggerClick();
      }
    },
    disabled: disabled || trigger.props.disabled,
    'aria-expanded': isOpen,
    'aria-haspopup': 'menu',
    className: `${trigger.props.className || ''} qr-dropdown__trigger`.trim(),
  });

  return (
    <div ref={dropdownRef} className={dropdownClasses} style={style} onKeyDown={handleKeyDown}>
      <div ref={triggerWrapperRef} className="qr-dropdown__trigger-wrapper">
        {triggerElement}
      </div>

      {isOpen && (
        <div ref={menuRef} className={menuClasses} style={menuStyle} role="menu" aria-orientation="vertical">
          {options.map((option, index) => {
            const availableIndex = options.filter((opt, i) => i < index && !opt.disabled).length;
            const isFocused = focusedIndex === availableIndex && !option.disabled;

            return (
              <React.Fragment key={option.id}>
                <div
                  role="menuitem"
                  tabIndex={-1}
                  className={[
                    'qr-dropdown__option',
                    option.disabled && 'qr-dropdown__option--disabled',
                    option.destructive && 'qr-dropdown__option--destructive',
                    isFocused && 'qr-dropdown__option--focused',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleOptionSelect(option)}
                  aria-disabled={option.disabled}
                >
                  {option.icon && <span className="qr-dropdown__option-icon">{option.icon}</span>}
                  <span className="qr-dropdown__option-label">{option.label}</span>
                </div>
                {option.divider && <div className="qr-dropdown__divider" role="separator" />}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
