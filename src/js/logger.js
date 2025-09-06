/**
 * Универсальный логгер для проекта Icon Offerer
 * Поддерживает условное логирование только в dev режиме
 */

class Logger {
    constructor() {
        // Определяем режим разработки
        this.isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0';
    }
    
    // Обычное логирование
    log(...args) {
        if (this.isDev) {
            console.log(...args);
        }
    }
    
    // Логирование ошибок
    error(...args) {
        if (this.isDev) {
            console.error(...args);
        }
    }
    
    // Логирование предупреждений
    warn(...args) {
        if (this.isDev) {
            console.warn(...args);
        }
    }
    
    // Информационное логирование
    info(...args) {
        if (this.isDev) {
            console.info(...args);
        }
    }
    
    // Отладочное логирование
    debug(...args) {
        if (this.isDev) {
            console.debug(...args);
        }
    }
    
    // Группировка логов
    group(label) {
        if (this.isDev) {
            console.group(label);
        }
    }
    
    groupEnd() {
        if (this.isDev) {
            console.groupEnd();
        }
    }
    
    // Логирование с временной меткой
    time(label) {
        if (this.isDev) {
            console.time(label);
        }
    }
    
    timeEnd(label) {
        if (this.isDev) {
            console.timeEnd(label);
        }
    }
    
    // Проверка режима разработки
    isDevelopment() {
        return this.isDev;
    }
}

// Создаем глобальный экземпляр логгера только если он еще не существует
if (!window.logger) {
    window.logger = new Logger();
}

// Экспортируем для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
