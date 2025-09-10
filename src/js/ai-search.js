class AISearch {
  constructor() {
    this.apiUrl = window.aiSerchUrl;
    this.isSearching = false;
    this.currentRequest = null;
    this.isAvailable = true;
  }

  generateCacheKey(platform, request) {
    return `ai_search_${platform}_${request}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  getFromCache(cacheKey) {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch {
      return null;
    }
  }

  saveToCache(cacheKey, data) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      // Игнорируем ошибки кеша
    }
  }

  async searchIcons(platform, request) {
    if (this.isSearching) {
      if (this.currentRequest) {
        this.currentRequest.abort();
        this.currentRequest = null;
      }
    }

    const cacheKey = this.generateCacheKey(platform, request);
    const cachedResult = this.getFromCache(cacheKey);
    
    if (cachedResult) {
      return {
        success: true,
        icons: cachedResult.icon_names,
        meta: { cached: true },
        fromCache: true
      };
    }

    this.isSearching = true;
    
    try {
      this.currentRequest = new AbortController();
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ platform, request }),
        signal: this.currentRequest.signal,
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.icon_names) {
        this.saveToCache(cacheKey, result.data);
        return {
          success: true,
          icons: result.data.icon_names,
          meta: result.meta
        };
      } else {
        throw new Error('Неверный формат ответа от AI сервиса');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Запрос отменен' };
      }
      
      if (error.message.includes('CORS') || error.message.includes('cross-origin') || 
          error.message.includes('blocked') || error.message.includes('Mixed Content')) {
        this.isAvailable = false;
        return { 
          success: false, 
          error: 'AI-поиск недоступен из-за ограничений CORS' 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Ошибка при выполнении AI поиска' 
      };
    } finally {
      this.isSearching = false;
      this.currentRequest = null;
    }
  }

  isAISearchAvailable() {
    return this.isAvailable;
  }
}

// Создаем глобальный экземпляр
window.aiSearch = new AISearch();
