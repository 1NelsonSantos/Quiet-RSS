/**
 * Storage adapter interface that provides a unified API for different storage mechanisms.
 * This allows the same core logic to work with both desktop (localStorage) and mobile (AsyncStorage).
 */
export interface StorageAdapter {
  /**
   * Retrieve a value from storage by key
   * @param key - The storage key to retrieve
   * @returns Promise that resolves to the stored value or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Store a value in storage with the given key
   * @param key - The storage key to use
   * @param value - The string value to store
   * @returns Promise that resolves when the value is stored
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove a value from storage by key
   * @param key - The storage key to remove
   * @returns Promise that resolves when the value is removed
   */
  removeItem(key: string): Promise<void>;
}
