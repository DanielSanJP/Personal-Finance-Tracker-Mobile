import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

class WebStorage implements StorageAdapter {
  private isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
    } catch {
      return false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set item in localStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove item from localStorage:', error);
    }
  }
}

class NativeStorage implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get item from AsyncStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set item in AsyncStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove item from AsyncStorage:', error);
    }
  }
}

// Export the appropriate storage based on platform
export const storage: StorageAdapter = Platform.OS === 'web' 
  ? new WebStorage() 
  : new NativeStorage();

export default storage;
