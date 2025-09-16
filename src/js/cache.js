/**
 * LocalStorage cache module
 */

export class LocalStorageCache {
  constructor(prefix) {
    this.prefix = prefix;
  }

  /**
   * Generates cache key for request
   * @param {string} key - Key for caching
   * @returns {string} Cache key
   */
  #generateCacheKey(key) {
    return `${this.prefix}_${key}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Gets data from cache
   * @param {string} key - Key to get data
   * @returns {Object|null} Cached data or null
   */
  get(key) {
    try {
      const cacheKey = this.#generateCacheKey(key);
      const cachedData = localStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Saves data to cache
   * @param {string} key - Key for saving
   * @param {Object} data - Data to save
   */
  set(key, data) {
    try {
      const cacheKey = this.#generateCacheKey(key);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      // Ignore cache errors
    }
  }

  /**
   * Checks if data exists in cache
   * @param {string} key - Key to check
   * @returns {boolean} Whether data exists in cache
   */
  has(key) {
    try {
      const cacheKey = this.#generateCacheKey(key);
      return localStorage.getItem(cacheKey) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Removes data from cache
   * @param {string} key - Key to remove
   */
  remove(key) {
    try {
      const cacheKey = this.#generateCacheKey(key);
      localStorage.removeItem(cacheKey);
    } catch {
      // Ignore cache errors
    }
  }

  /**
   * Clears all cache with prefix
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore cache errors
    }
  }

  /**
   * Gets all cache keys with prefix
   * @returns {string[]} Array of cache keys
   */
  keys() {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter(key => key.startsWith(this.prefix));
    } catch {
      return [];
    }
  }
}
