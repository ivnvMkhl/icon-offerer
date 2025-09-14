/**
 * API module for HTTP requests
 */

import { LocalStorageCache } from './cache.js';

export class API {
  #searchApiUrl;

  constructor(searchApiUrl) {
    this.#searchApiUrl = searchApiUrl;
  }

  /**
   * Performs icon search via AI API
   * @param {string} platform - Platform for search
   * @param {string} request - Search query text
   * @returns {Promise<Object>} Search result
   */
  async aiSearch(platform, request) {
    const cache = new LocalStorageCache('ai_search');
    const cacheKey = JSON.stringify({ platform, request });
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return {
        success: true,
        icons: cachedResult.icon_names,
        meta: { cached: true },
        fromCache: true
      };
    }

    try {
      const response = await fetch(this.#searchApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ platform, request }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.icon_names) {
        cache.set(cacheKey, result.data);
        return {
          success: true,
          icons: result.data.icon_names,
          meta: result.meta
        };
      } else {
        throw new Error('Неверный формат ответа от AI сервиса');
      }

    } catch (error) {
      if (error.message.includes('CORS') || error.message.includes('cross-origin') || 
          error.message.includes('blocked') || error.message.includes('Mixed Content')) {
        return { 
          success: false, 
          error: 'AI-поиск недоступен из-за ограничений CORS' 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Ошибка при выполнении AI поиска' 
      };
    }
  }

}

