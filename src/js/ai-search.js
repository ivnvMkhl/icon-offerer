/**
 * Модуль для AI-поиска иконок через Yandex Cloud Functions
 */

if (typeof AISearch === 'undefined') {
class AISearch {
  constructor() {
    this.apiUrl = window.aiSerchUrl;
    this.isSearching = false;
    this.currentRequest = null;
    this.isAvailable = true;
    this.cachePrefix = 'ai_search_cache_';
  }

  /**
   * Генерирует ключ кеша на основе платформы и запроса
   * @param {string} platform - Платформа (antd, mui, unicode)
   * @param {string} request - Текстовый запрос пользователя
   * @returns {Promise<string>} Ключ кеша
   */
  async generateCacheKey(platform, request) {
    const payload = JSON.stringify({ platform, request });
    
    // Используем crypto.subtle для создания SHA-256 хеша
    if (window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return this.cachePrefix + hashHex;
      } catch (error) {
        window.logger.warn('Ошибка при создании crypto хеша, используем fallback:', error);
      }
    }
    
    // Fallback на простой хеш если crypto недоступен
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return this.cachePrefix + Math.abs(hash).toString(36);
  }

  /**
   * Получает данные из кеша
   * @param {string} cacheKey - Ключ кеша
   * @returns {Object|null} Данные из кеша или null
   */
  getFromCache(cacheKey) {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        window.logger.log('Найдены данные в кеше:', parsed);
        return parsed;
      }
    } catch (error) {
      window.logger.warn('Ошибка при чтении кеша:', error);
    }
    return null;
  }

  /**
   * Сохраняет данные в кеш
   * @param {string} cacheKey - Ключ кеша
   * @param {Object} data - Данные для сохранения
   */
  saveToCache(cacheKey, data) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      window.logger.log('Данные сохранены в кеш:', data);
    } catch (error) {
      window.logger.warn('Ошибка при сохранении в кеш:', error);
    }
  }

  /**
   * Выполняет AI-поиск иконок по текстовому запросу
   * @param {string} platform - Платформа (antd, mui, unicode)
   * @param {string} request - Текстовый запрос пользователя
   * @returns {Promise<Object>} Результат поиска
   */
  async searchIcons(platform, request) {
    if (this.isSearching) {
      window.logger.log('AI поиск уже выполняется, отменяем предыдущий запрос');
      this.cancelCurrentRequest();
    }

    // Проверяем кеш перед отправкой запроса
    const cacheKey = await this.generateCacheKey(platform, request);
    const cachedResult = this.getFromCache(cacheKey);
    
    if (cachedResult) {
      window.logger.log('Возвращаем результат из кеша');
      return {
        success: true,
        icons: cachedResult.icon_names,
        meta: { cached: true },
        fromCache: true
      };
    }

    this.isSearching = true;
    
    try {
      const requestData = {
        platform: platform,
        request: request
      };

      window.logger.log('Отправляем AI запрос:', requestData);

      // Создаем AbortController для возможности отмены запроса
      this.currentRequest = new AbortController();
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: this.currentRequest.signal,
        mode: 'cors',
        credentials: 'omit' // Не отправляем cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      window.logger.log('AI ответ получен:', result);
      
      if (result.success && result.data && result.data.icon_names) {
        window.logger.log(`AI сервис вернул ${result.data.icon_names.length} иконок:`, result.data.icon_names);
        
        // Сохраняем результат в кеш
        this.saveToCache(cacheKey, result.data);
        
        return {
          success: true,
          icons: result.data.icon_names,
          meta: result.meta
        };
      } else {
        window.logger.error('Неверный формат ответа от AI сервиса:', result);
        throw new Error('Неверный формат ответа от AI сервиса');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        window.logger.log('AI запрос был отменен');
        return { success: false, error: 'Запрос отменен' };
      }
      
      // Если CORS ошибка, отключаем AI-поиск
      if (error.message.includes('CORS') || error.message.includes('cross-origin') || 
          error.message.includes('blocked') || error.message.includes('Mixed Content') ||
          error.message.includes('Access-Control-Allow-Origin')) {
        window.logger.warn('CORS ошибка, AI-поиск недоступен');
        this.isAvailable = false;
        return { 
          success: false, 
          error: 'AI-поиск недоступен из-за ограничений CORS. Пожалуйста, обратитесь к администратору для настройки CORS заголовков в Cloud Function.' 
        };
      }
      
      window.logger.error('Ошибка AI поиска:', error);
      
      // Детальная диагностика ошибок
      let errorMessage = error.message || 'Ошибка при выполнении AI поиска';
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Не удалось подключиться к серверу AI-поиска. Проверьте подключение к интернету.';
      } else if (error.name === 'SyntaxError') {
        errorMessage = 'Сервер вернул некорректный ответ. Возможно, проблема с CORS настройками.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      this.isSearching = false;
      this.currentRequest = null;
    }
  }

  /**
   * Проверяет, доступен ли AI-поиск
   * @returns {boolean}
   */
  isAISearchAvailable() {
    return this.isAvailable;
  }

  /**
   * Отменяет текущий AI запрос
   */
  cancelCurrentRequest() {
    if (this.currentRequest) {
      this.currentRequest.abort();
      this.currentRequest = null;
    }
  }

  /**
   * Проверяет, выполняется ли сейчас AI поиск
   * @returns {boolean}
   */
  isSearchingNow() {
    return this.isSearching;
  }
}

// Создаем глобальный экземпляр
window.aiSearch = new AISearch();
}
