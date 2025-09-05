// Функциональность для страницы Material Design Icons

// Глобальная функция для инициализации после загрузки иконок
function initMuiIcons(iconPaths) {
    const searchInput = document.getElementById('iconSearch');
    const iconsGrid = document.getElementById('iconsGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    const iconCards = document.querySelectorAll('.icon-card');
    const copyButtons = document.querySelectorAll('.copy-btn');

    // Инициализация
    initSearch();
    initCopyButtons();
    loadIcons(iconPaths); // Call to load icons with paths
    updateResultsCount(iconCards.length);

    // Поиск иконок
    function initSearch() {
        if (!searchInput) return;

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            filterIcons(query);
        });
    }

    // Фильтрация иконок
    function filterIcons(query) {
        let visibleCount = 0;

        iconCards.forEach(card => {
            const iconName = card.dataset.name.toLowerCase();
            const keywords = card.dataset.keywords.toLowerCase();
            
            const isVisible = query === '' || 
                             iconName.includes(query) || 
                             keywords.includes(query);

            if (isVisible) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
            
            if (isVisible) {
                visibleCount++;
            }
        });

        // Показать/скрыть сообщение "не найдено"
        if (visibleCount === 0 && query !== '') {
            noResults.style.display = 'block';
            iconsGrid.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            iconsGrid.style.display = 'grid';
        }

        updateResultsCount(visibleCount);
    }

    // Обновление счетчика результатов
    function updateResultsCount(count) {
        if (resultsCount) {
            resultsCount.innerHTML = `Найдено иконок: <strong>${count}</strong>`;
        }
    }

    // Копирование названий иконок
    function initCopyButtons() {
        copyButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                copyIconName(this);
            });
        });
    }

    // Копирование названия иконки в буфер обмена
    function copyIconName(button) {
        const iconName = button.dataset.icon;
        
        if (navigator.clipboard && window.isSecureContext) {
            // Современный API
            navigator.clipboard.writeText(iconName).then(() => {
                showCopySuccess(button);
            }).catch(() => {
                fallbackCopy(iconName, button);
            });
        } else {
            // Fallback для старых браузеров
            fallbackCopy(iconName, button);
        }
    }

    // Fallback метод копирования
    function fallbackCopy(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopySuccess(button);
        } catch (err) {
            console.error('Не удалось скопировать текст:', err);
        }
        
        document.body.removeChild(textArea);
    }

    // Показать успешное копирование
    function showCopySuccess(button) {
        const originalText = button.querySelector('.copy-text').textContent;
        const textElement = button.querySelector('.copy-text');
        
        button.classList.add('copied');
        textElement.textContent = 'Скопировано';
        
        setTimeout(() => {
            button.classList.remove('copied');
            textElement.textContent = originalText;
        }, 2000);
    }

    // Клик по карточке иконки (копирование)
    iconCards.forEach(card => {
        card.addEventListener('click', function() {
            const copyBtn = this.querySelector('.copy-btn');
            if (copyBtn) {
                copyIconName(copyBtn);
            }
        });
    });

    // Горячие клавиши
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + F для фокуса на поиск
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Escape для очистки поиска
        if (e.key === 'Escape') {
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                filterIcons('');
            }
        }
    });

    // Загрузка иконок Material Design
    function loadIcons(iconPaths) {
        const iconPlaceholders = document.querySelectorAll('.icon-placeholder');
        
        iconPlaceholders.forEach(placeholder => {
            const iconName = placeholder.dataset.icon;
            if (iconName) {
                loadMuiIcon(placeholder, iconName, iconPaths);
            }
        });
    }

    // Загрузка конкретной иконки Material Design
    function loadMuiIcon(placeholder, iconName, iconPaths) {
        // Создаем SVG элемент для иконки
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        svg.style.color = '#666';
        
        // Создаем path элемент
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Получаем путь для иконки или используем дефолтный
        const iconPath = iconPaths[iconName] || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
        path.setAttribute('d', iconPath);
        
        svg.appendChild(path);
        placeholder.innerHTML = '';
        placeholder.appendChild(svg);
    }
}
