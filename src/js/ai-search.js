/**
 * Модуль для AI-поиска иконок через Yandex Cloud Functions
 */

class AISearch {
  constructor() {
    // Прямой запрос к Yandex Cloud Functions
    this.apiUrl = 'https://functions.yandexcloud.net/d4ej3hujkeaaoaun3kh8';
    this.isSearching = false;
    this.currentRequest = null;
    this.isAvailable = true; // Флаг доступности AI-поиска
  }

  /**
   * Выполняет AI-поиск иконок по текстовому запросу
   * @param {string} platform - Платформа (antd, mui, unicode)
   * @param {string} request - Текстовый запрос пользователя
   * @returns {Promise<Object>} Результат поиска
   */
  async searchIcons(platform, request) {
    if (this.isSearching) {
      console.log('AI поиск уже выполняется, отменяем предыдущий запрос');
      this.cancelCurrentRequest();
    }

    this.isSearching = true;
    
    try {
      const requestData = {
        platform: platform,
        request: request
      };

      console.log('Отправляем AI запрос:', requestData);

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
      
      console.log('AI ответ получен:', result);
      
      if (result.success && result.data && result.data.icon_names) {
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
        console.log('AI запрос был отменен');
        return { success: false, error: 'Запрос отменен' };
      }
      
      // Если CORS ошибка, отключаем AI-поиск
      if (error.message.includes('CORS') || error.message.includes('cross-origin') || 
          error.message.includes('blocked') || error.message.includes('Mixed Content') ||
          error.message.includes('Access-Control-Allow-Origin')) {
        console.warn('CORS ошибка, AI-поиск недоступен');
        this.isAvailable = false;
        return { 
          success: false, 
          error: 'AI-поиск недоступен из-за ограничений CORS. Пожалуйста, обратитесь к администратору для настройки CORS заголовков в Cloud Function.' 
        };
      }
      
      console.error('Ошибка AI поиска:', error);
      
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
