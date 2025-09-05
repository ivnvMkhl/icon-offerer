// Основной JavaScript файл для Icon Offerer

document.addEventListener('DOMContentLoaded', function() {
    console.log('Icon Offerer загружен!');
    
    // Инициализация функций
    initSmoothScrolling();
    initSearch();
    initIconInteractions();
});

// Плавная прокрутка для якорных ссылок
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Инициализация поиска (заглушка для будущего функционала)
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            console.log('Поиск:', query);
            // Здесь будет логика поиска иконок
        });
    }
}

// Взаимодействие с иконками
function initIconInteractions() {
    const iconItems = document.querySelectorAll('.icon-item');
    
    iconItems.forEach(item => {
        item.addEventListener('click', function() {
            const iconName = this.querySelector('span').textContent;
            console.log('Выбрана иконка:', iconName);
            
            // Добавляем визуальную обратную связь
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Утилиты
function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Экспорт функций для использования в других модулях
window.IconOfferer = {
    showNotification,
    initSmoothScrolling,
    initSearch,
    initIconInteractions
};
