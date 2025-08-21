import React, { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { BaseComponentProps } from '@quiet-rss/types';

export interface VirtualListItem {
  id: string | number;
  [key: string]: any;
}

export interface VirtualListProps<T extends VirtualListItem> extends Omit<BaseComponentProps, 'variant' | 'loading'> {
  // Data and rendering
  items: T[];
  renderItem: (params: { item: T; index: number; isVisible: boolean }) => ReactNode;

  // Sizing and layout
  containerHeight: number | string;
  itemHeight?: number | 'auto';
  overscanCount?: number;

  // Styling
  className?: string;
  style?: React.CSSProperties;

  // Scroll behavior
  onScroll?: (scrollTop: number, scrollDirection: 'up' | 'down') => void;
  scrollToIndex?: number;
  scrollToAlignment?: 'start' | 'center' | 'end' | 'auto';

  // Performance options
  enableSmoothScrolling?: boolean;
  estimatedItemHeight?: number;

  // Empty state
  emptyComponent?: ReactNode;
  loadingComponent?: ReactNode;

  // Accessibility
  role?: string;
  ariaLabel?: string;
}

interface ItemHeightCache {
  [index: number]: number;
}

interface VirtualizedRange {
  startIndex: number;
  endIndex: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
}

/**
 * VirtualList component for efficiently rendering large lists
 * Only renders items currently visible in the viewport for optimal performance
 * @param items - Array of data items to render
 * @param renderItem - Function to render each item
 * @param containerHeight - Height of the scrollable container
 * @param itemHeight - Fixed height per item, or 'auto' for dynamic heights
 * @param overscanCount - Number of extra items to render outside viewport (default: 3)
 * @param onScroll - Callback when scrolling occurs
 * @param scrollToIndex - Index to scroll to programmatically
 * @param scrollToAlignment - How to align the scrolled-to item
 * @param enableSmoothScrolling - Enable CSS smooth scrolling behavior
 * @param estimatedItemHeight - Estimated height for auto-height items (default: 80)
 * @param emptyComponent - Component to show when no items
 * @param loadingComponent - Component to show when loading
 * @param size - Component size variant (sm, md, lg)
 * @param disabled - Whether the list is disabled
 * @param className - Additional CSS classes
 * @param style - Inline styles
 * @param role - ARIA role (default: 'list')
 * @param ariaLabel - ARIA label for accessibility
 */
export const VirtualList = <T extends VirtualListItem>({
  items,
  renderItem,
  containerHeight,
  itemHeight = 'auto',
  overscanCount = 3,
  size = 'md',
  disabled = false,
  onScroll,
  scrollToIndex,
  scrollToAlignment = 'auto',
  enableSmoothScrolling = true,
  estimatedItemHeight = 80,
  emptyComponent,
  loadingComponent,
  className = '',
  style,
  role = 'list',
  ariaLabel,
}: VirtualListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // State management
  const [scrollTop, setScrollTop] = useState(0);
  const [heightCache, setHeightCache] = useState<ItemHeightCache>({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isScrolling, setIsScrolling] = useState(false);

  // Scroll direction tracking
  const lastScrollTop = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // ResizeObserver for dynamic height measurement
  const resizeObserver = useRef<ResizeObserver>();

  // Initialize ResizeObserver for auto-height items
  useEffect(() => {
    if (itemHeight === 'auto') {
      resizeObserver.current = new ResizeObserver(entries => {
        const newHeights: ItemHeightCache = { ...heightCache };
        let hasChanges = false;

        entries.forEach(entry => {
          const element = entry.target as HTMLDivElement;
          const index = parseInt(element.dataset.index || '0', 10);
          const height = entry.contentRect.height;

          if (newHeights[index] !== height) {
            newHeights[index] = height;
            hasChanges = true;
          }
        });

        if (hasChanges) {
          setHeightCache(newHeights);
        }
      });
    }

    return () => {
      resizeObserver.current?.disconnect();
    };
  }, [itemHeight, heightCache]);

  // Container size observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Get item height (fixed or from cache)
  const getItemHeight = useCallback(
    (index: number): number => {
      if (itemHeight !== 'auto') {
        return itemHeight;
      }
      return heightCache[index] || estimatedItemHeight;
    },
    [itemHeight, heightCache, estimatedItemHeight]
  );

  // Calculate total height of all items
  const getTotalHeight = useCallback((): number => {
    if (items.length === 0) {
      return 0;
    }

    if (itemHeight !== 'auto') {
      return items.length * itemHeight;
    }

    let totalHeight = 0;
    for (let i = 0; i < items.length; i++) {
      totalHeight += getItemHeight(i);
    }
    return totalHeight;
  }, [items.length, itemHeight, getItemHeight]);

  // Get offset position for a specific index
  const getItemOffset = useCallback(
    (index: number): number => {
      if (itemHeight !== 'auto') {
        return index * itemHeight;
      }

      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    },
    [itemHeight, getItemHeight]
  );

  // Find index at a specific offset
  const findIndexAtOffset = useCallback(
    (offset: number): number => {
      if (itemHeight !== 'auto') {
        return Math.floor(offset / itemHeight);
      }

      let currentOffset = 0;
      for (let i = 0; i < items.length; i++) {
        const height = getItemHeight(i);
        if (currentOffset + height > offset) {
          return i;
        }
        currentOffset += height;
      }
      return items.length - 1;
    },
    [itemHeight, getItemHeight, items.length]
  );

  // Calculate which items should be rendered
  const getRangeToRender = useCallback((): VirtualizedRange => {
    const containerHeight = typeof containerSize.height === 'number' ? containerSize.height : 0;

    if (items.length === 0 || containerHeight === 0) {
      return { startIndex: 0, endIndex: 0, visibleStartIndex: 0, visibleEndIndex: 0 };
    }

    const visibleStartIndex = findIndexAtOffset(scrollTop);
    const visibleEndIndex = findIndexAtOffset(scrollTop + containerHeight);

    // Add overscan
    const startIndex = Math.max(0, visibleStartIndex - overscanCount);
    const endIndex = Math.min(items.length - 1, visibleEndIndex + overscanCount);

    return { startIndex, endIndex, visibleStartIndex, visibleEndIndex };
  }, [items.length, containerSize.height, scrollTop, findIndexAtOffset, overscanCount]);

  const range = getRangeToRender();
  const totalHeight = getTotalHeight();

  // Handle scroll events
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      const newScrollTop = element.scrollTop;
      const direction = newScrollTop > lastScrollTop.current ? 'down' : 'up';

      setScrollTop(newScrollTop);
      lastScrollTop.current = newScrollTop;

      if (!isScrolling) {
        setIsScrolling(true);
      }

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set new timeout to detect end of scrolling
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      onScroll?.(newScrollTop, direction);
    },
    [isScrolling, onScroll]
  );

  // Programmatic scrolling
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollElementRef.current) {
      const offset = getItemOffset(scrollToIndex);
      const element = scrollElementRef.current;

      if (scrollToAlignment === 'start') {
        element.scrollTop = offset;
      } else if (scrollToAlignment === 'center') {
        const containerHeight = element.clientHeight;
        const itemHeight = getItemHeight(scrollToIndex);

        element.scrollTop = offset - (containerHeight - itemHeight) / 2;
      } else if (scrollToAlignment === 'end') {
        const containerHeight = element.clientHeight;
        const itemHeight = getItemHeight(scrollToIndex);

        element.scrollTop = offset - containerHeight + itemHeight;
      } else {
        // Auto alignment
        const currentScrollTop = element.scrollTop;
        const containerHeight = element.clientHeight;

        if (offset < currentScrollTop) {
          element.scrollTop = offset;
        } else if (offset + getItemHeight(scrollToIndex) > currentScrollTop + containerHeight) {
          element.scrollTop = offset - containerHeight + getItemHeight(scrollToIndex);
        }
      }
    }
  }, [scrollToIndex, scrollToAlignment, getItemOffset, getItemHeight]);

  // Render visible items
  const renderVisibleItems = () => {
    if (items.length === 0) {
      return emptyComponent || <div className="qr-virtual-list__empty">No items to display</div>;
    }

    const visibleItems = [];
    const startOffset = getItemOffset(range.startIndex);

    for (let i = range.startIndex; i <= range.endIndex; i++) {
      const item = items[i];
      if (!item) {
        continue;
      }

      const itemOffset = getItemOffset(i) - startOffset;
      const isVisible = i >= range.visibleStartIndex && i <= range.visibleEndIndex;

      visibleItems.push(
        <div
          key={item.id}
          ref={el => {
            itemsRef.current[i] = el;
            if (el && itemHeight === 'auto' && resizeObserver.current) {
              el.dataset.index = i.toString();
              resizeObserver.current.observe(el);
            }
          }}
          className={`qr-virtual-list__item ${!isVisible ? 'qr-virtual-list__item--hidden' : ''}`}
          style={{
            position: 'absolute',
            top: itemOffset,
            left: 0,
            right: 0,
            ...(itemHeight !== 'auto' && { height: itemHeight }),
          }}
          role="listitem"
        >
          {renderItem({ item, index: i, isVisible })}
        </div>
      );
    }

    return visibleItems;
  };

  const containerHeightPx = typeof containerHeight === 'string' ? containerHeight : `${containerHeight}px`;

  const classes = [
    'qr-virtual-list',
    `qr-virtual-list--${size}`,
    disabled && 'qr-virtual-list--disabled',
    isScrolling && 'qr-virtual-list--scrolling',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerProps: React.HTMLAttributes<HTMLDivElement> = {
    className: classes,
    style: {
      height: containerHeightPx,
      ...style,
    },
    role,
    ...(ariaLabel && { 'aria-label': ariaLabel }),
  };

  if (loadingComponent) {
    return (
      <div ref={containerRef} {...containerProps}>
        <div className="qr-virtual-list__loading">{loadingComponent}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} {...containerProps}>
      <div
        ref={scrollElementRef}
        className="qr-virtual-list__scroll-container"
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflow: 'auto',
          ...(enableSmoothScrolling && { scrollBehavior: 'smooth' }),
        }}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={e => {
          if (disabled) return;

          // Basic keyboard navigation
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const direction = e.key === 'ArrowDown' ? 1 : -1;
            const currentIndex = findIndexAtOffset(scrollTop + containerSize.height / 2);
            const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));

            if (nextIndex !== currentIndex) {
              const offset = getItemOffset(nextIndex);
              scrollElementRef.current!.scrollTop = offset;
            }
          }
        }}
      >
        <div className="qr-virtual-list__spacer" style={{ height: totalHeight, position: 'relative' }}>
          {renderVisibleItems()}
        </div>
      </div>
    </div>
  );
};
