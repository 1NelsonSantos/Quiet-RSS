import React, { useState } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface TabItem {
  // Unique identifier for the tab
  value: string;
  // Display label for the tab
  label: string;
  // Tab content to display when active
  content: React.ReactNode;
  // Optional icon for the tab
  icon?: React.ReactNode;
  // Badge/count to display on the tab
  badge?: string | number;
  // Whether this tab is disabled
  disabled?: boolean;
  // Optional tooltip text
  tooltip?: string;
}

export interface TabsProps extends Omit<BaseComponentProps, 'loading' | 'variant'> {
  // Array of tab items
  tabs: TabItem[];
  // Currently active tab value
  value?: string;
  // Default active tab value for uncontrolled usage
  defaultValue?: string;
  // Callback when active tab changes
  onChange?: (value: string) => void;
  // Tab list orientation
  orientation?: 'horizontal' | 'vertical';
  // Tab variant style
  variant?: 'default' | 'pills' | 'underline';
  // Whether tabs should fill available space
  fullWidth?: boolean;
  // Whether tab content should be lazy loaded
  lazy?: boolean;
  // Whether to show tab content with animation
  animated?: boolean;
  // Additional CSS class names
  className?: string;
  // Inline styles
  style?: React.CSSProperties;
  // HTML id attribute
  id?: string;
}

/**
 * Tabs component for organizing content into switchable panels
 * @param tabs - Array of tab items with value, label, content
 * @param value - Currently active tab value (controlled)
 * @param defaultValue - Default active tab value (uncontrolled)
 * @param onChange - Callback when active tab changes
 * @param orientation - Tab list orientation (horizontal, vertical)
 * @param variant - Tab style variant (default, pills, underline)
 * @param fullWidth - Whether tabs should fill available space
 * @param lazy - Whether tab content should be lazy loaded
 * @param animated - Whether to show content with animation
 * @param size - Size variant (sm, md, lg)
 * @param disabled - Whether entire tab set is disabled
 * @param className - Additional CSS classes
 * @param style - Inline styles
 * @param id - HTML id attribute
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value: controlledValue,
  defaultValue,
  onChange,
  orientation = 'horizontal',
  variant = 'default',
  fullWidth = false,
  lazy = false,
  animated = true,
  size = 'md',
  disabled = false,
  className = '',
  style,
  id,
}) => {
  const [internalValue, setInternalValue] = useState<string>(defaultValue || tabs[0]?.value || '');
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(lazy ? [] : tabs.map(tab => tab.value)));

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const activeTab = tabs.find(tab => tab.value === currentValue);

  const baseClasses = [
    'qr-tabs',
    `qr-tabs--${size}`,
    `qr-tabs--${orientation}`,
    `qr-tabs--${variant}`,
    fullWidth && 'qr-tabs--full-width',
    animated && 'qr-tabs--animated',
    disabled && 'qr-tabs--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const tabsId = id || `qr-tabs-${Math.random().toString(36).substr(2, 9)}`;

  const handleTabChange = (tabValue: string) => {
    const tab = tabs.find(t => t.value === tabValue);
    if (disabled || tab?.disabled) {
      return;
    }

    if (!isControlled) {
      setInternalValue(tabValue);
    }

    if (lazy && !loadedTabs.has(tabValue)) {
      setLoadedTabs(prev => new Set([...prev, tabValue]));
    }

    if (onChange) {
      onChange(tabValue);
    }
  };

  const renderTabButton = (tab: TabItem, index: number) => {
    const isActive = currentValue === tab.value;
    const isDisabled = disabled || tab.disabled;
    const tabId = `${tabsId}-tab-${index}`;
    const panelId = `${tabsId}-panel-${index}`;

    const tabClasses = [
      'qr-tabs__tab',
      `qr-tabs__tab--${size}`,
      isActive && 'qr-tabs__tab--active',
      isDisabled && 'qr-tabs__tab--disabled',
      tab.icon && 'qr-tabs__tab--with-icon',
      tab.badge && 'qr-tabs__tab--with-badge',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        key={tab.value}
        id={tabId}
        className={tabClasses}
        role="tab"
        aria-selected={isActive}
        aria-controls={panelId}
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={() => handleTabChange(tab.value)}
        title={tab.tooltip}
        tabIndex={0}
      >
        {tab.icon && (
          <span className="qr-tabs__tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
        )}

        <span className="qr-tabs__tab-label">{tab.label}</span>

        {tab.badge && (
          <span className="qr-tabs__tab-badge" aria-hidden="true">
            {tab.badge}
          </span>
        )}
      </button>
    );
  };

  const renderTabContent = () => {
    if (!activeTab) {
      return null;
    }

    const panelId = `${tabsId}-panel-${tabs.findIndex(t => t.value === activeTab.value)}`;
    const shouldRenderContent = !lazy || loadedTabs.has(activeTab.value);

    return (
      <div
        className="qr-tabs__content"
        role="tabpanel"
        id={panelId}
        aria-labelledby={`${tabsId}-tab-${tabs.findIndex(t => t.value === activeTab.value)}`}
        tabIndex={0}
      >
        <div className="qr-tabs__panel">
          {shouldRenderContent ? activeTab.content : <div className="qr-tabs__loading">Loading...</div>}
        </div>
      </div>
    );
  };

  return (
    <div className={baseClasses} style={style} id={tabsId}>
      <div className="qr-tabs__list" role="tablist" aria-orientation={orientation}>
        {tabs.map((tab, index) => renderTabButton(tab, index))}
      </div>

      {renderTabContent()}
    </div>
  );
};
