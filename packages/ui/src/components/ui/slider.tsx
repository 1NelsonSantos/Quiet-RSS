import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface SliderProps extends Omit<BaseComponentProps, 'loading'> {
  // Current value
  value?: number;
  // Default value for uncontrolled usage
  defaultValue?: number;
  // Minimum value
  min?: number;
  // Maximum value
  max?: number;
  // Step increment
  step?: number;
  // Callback when value changes
  onChange?: (value: number) => void;
  // Callback when sliding stops (mouse up / touch end)
  onChangeCommitted?: (value: number) => void;
  // Label for the slider
  label?: string;
  // Whether to show value label
  showValue?: boolean;
  // Value formatter function
  formatValue?: (value: number) => string;
  // Whether to show tick marks
  showTicks?: boolean;
  // Custom tick marks (array of values or number for count)
  ticks?: number[] | number;
  // HTML id attribute
  id?: string;
  // HTML name attribute for forms
  name?: string;
  // Whether the slider is read-only
  readOnly?: boolean;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // ARIA label for accessibility
  'aria-label'?: string;
  // ARIA labelledby for accessibility
  'aria-labelledby'?: string;
}

/**
 * Slider component for selecting values from a range
 * Useful for settings like font size, refresh intervals, layout preferences
 * @param value - Current value (controlled)
 * @param defaultValue - Default value (uncontrolled)
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 100)
 * @param step - Step increment (default: 1)
 * @param onChange - Callback when value changes
 * @param onChangeCommitted - Callback when sliding stops
 * @param label - Label for the slider
 * @param showValue - Whether to show value label
 * @param formatValue - Function to format displayed value
 * @param showTicks - Whether to show tick marks
 * @param ticks - Custom tick marks
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether slider is disabled
 * @param readOnly - Whether slider is read-only
 * @param className - Additional CSS classes
 * @param style - Inline styles
 */
export const Slider: React.FC<SliderProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeCommitted,
  label,
  showValue = false,
  formatValue,
  showTicks = false,
  ticks,
  size = 'md',
  disabled = false,
  readOnly = false,
  className = '',
  style,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const baseClasses = [
    'qr-slider',
    `qr-slider--${size}`,
    disabled && 'qr-slider--disabled',
    readOnly && 'qr-slider--readonly',
    isDragging && 'qr-slider--dragging',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const percentage = ((currentValue - min) / (max - min)) * 100;

  const formatDisplayValue = useCallback(
    (val: number) => {
      if (formatValue) {
        return formatValue(val);
      }
      return val.toString();
    },
    [formatValue]
  );

  const updateValue = useCallback(
    (newValue: number, committed = false) => {
      // Cap value to min/max bounds
      const capValue = Math.min(Math.max(newValue, min), max);

      // Round to nearest step
      const steppedValue = Math.round((capValue - min) / step) * step + min;
      const finalValue = Math.min(Math.max(steppedValue, min), max);

      if (!isControlled) {
        setInternalValue(finalValue);
      }

      if (onChange) {
        onChange(finalValue);
      }

      if (committed && onChangeCommitted) {
        onChangeCommitted(finalValue);
      }
    },
    [min, max, step, onChange, onChangeCommitted, isControlled]
  );

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return currentValue;

      const rect = sliderRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      const newValue = min + position * (max - min);

      return newValue;
    },
    [min, max, currentValue]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || readOnly) return;

      event.preventDefault();
      setIsDragging(true);

      const newValue = getValueFromPosition(event.clientX);
      updateValue(newValue);
    },
    [disabled, readOnly, getValueFromPosition, updateValue]
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || readOnly) return;

      event.preventDefault();
      setIsDragging(true);

      const touch = event.touches[0];
      const newValue = getValueFromPosition(touch.clientX);
      updateValue(newValue);
    },
    [disabled, readOnly, getValueFromPosition, updateValue]
  );


  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      const newValue = getValueFromPosition(event.clientX);
      updateValue(newValue);
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      const newValue = getValueFromPosition(touch.clientX);
      updateValue(newValue);
    };

    const handleEnd = () => {
      setIsDragging(false);
      updateValue(currentValue, true);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, getValueFromPosition, updateValue, currentValue]);

  const renderTicks = () => {
    if (!showTicks) {
      return null;
    }

    let tickValues: number[] = [];

    if (Array.isArray(ticks)) {
      tickValues = ticks.filter(tick => tick >= min && tick <= max);
    } else if (typeof ticks === 'number') {
      for (let i = 0; i <= ticks; i++) {
        tickValues.push(min + (i / ticks) * (max - min));
      }
    } else {
      // Default ticks every 25%
      for (let i = 0; i <= 4; i++) {
        tickValues.push(min + (i / 4) * (max - min));
      }
    }

    return (
      <div className="qr-slider__ticks">
        {tickValues.map((tick, index) => {
          const tickPercentage = ((tick - min) / (max - min)) * 100;
          return <div key={index} className="qr-slider__tick" style={{ left: `${tickPercentage}%` }} />;
        })}
      </div>
    );
  };

  return (
    <div className="qr-slider-container">
      {label && (
        <label className="qr-slider__label" htmlFor={id}>
          {label}
          {showValue && <span className="qr-slider__value">{formatDisplayValue(currentValue)}</span>}
        </label>
      )}

      <div className={baseClasses} style={style}>
        <div ref={sliderRef} className="qr-slider__track" onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
          <div className="qr-slider__progress" style={{ width: `${percentage}%` }} />

          {renderTicks()}

          <div
            className="qr-slider__thumb"
            style={{ left: `${percentage}%` }}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-disabled={disabled}
            aria-readonly={readOnly}
            id={id}
            data-name={name}
          />
        </div>
      </div>
    </div>
  );
};
