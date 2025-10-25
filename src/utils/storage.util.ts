/**
 * Storage Utility
 * Abstraction layer for storage operations
 * Easy to adapt for React Native (replace localStorage with AsyncStorage)
 */

export const storage = {
  /**
   * Get item from storage
   */
  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   */
  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
    }
  },

  /**
   * Remove item from storage
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
    }
  },

  /**
   * Clear all storage
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

/**
 * For React Native migration:
 * 
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * 
 * export const storage = {
 *   getItem: async <T>(key: string): Promise<T | null> => {
 *     try {
 *       const item = await AsyncStorage.getItem(key);
 *       return item ? JSON.parse(item) : null;
 *     } catch (error) {
 *       console.error(`Error getting item ${key}:`, error);
 *       return null;
 *     }
 *   },
 *   // ... similar pattern for other methods
 * };
 */
