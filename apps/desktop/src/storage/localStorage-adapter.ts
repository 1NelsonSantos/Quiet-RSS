import type { StorageAdapter } from '@quiet-rss/core';

/**
 * localStorage implementation of StorageAdapter for desktop applications.
 * Wraps browser localStorage API for the StorageAdapter interface.
 */
export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Retrieve a value from localStorage by key
   * @param key - The storage key to retrieve
   * @returns Promise that resolves to the stored value or null if not found
   * @throws Error if localStorage access fails
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read from localStorage: ${error.message}`);
      }

      throw new Error('Failed to read from localStorage: Unknown error');
    }
  }

  /**
   * Store a value in localStorage with the given key
   * @param key - The storage key to use
   * @param value - The string value to store
   * @returns Promise that resolves when the value is stored
   * @throws Error if localStorage is not available or storage fails
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Handle localStorage errors
      if (error instanceof Error) {
        throw new Error(`Failed to save to localStorage: ${error.message}`);
      }

      throw new Error('Failed to save to localStorage: Unknown error');
    }
  }

  /**
   * Remove a value from localStorage by key
   * @param key - The storage key to remove
   * @returns Promise that resolves when the value is removed
   * @throws Error if localStorage removal fails
   */
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to remove from localStorage: ${error.message}`);
      }

      throw new Error('Failed to remove from localStorage: Unknown error');
    }
  }
}
