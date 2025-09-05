// Функциональность для страницы Ant Design Icons

// Глобальная функция для инициализации после загрузки иконок
function initAntdIcons(iconPaths) {
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

    // Загрузка иконок Ant Design
    function loadIcons(iconPaths) {
        const iconPlaceholders = document.querySelectorAll('.icon-placeholder');
        
        iconPlaceholders.forEach(placeholder => {
            const iconName = placeholder.dataset.icon;
            if (iconName) {
                loadAntdIcon(placeholder, iconName, iconPaths);
            }
        });
    }

    // Загрузка конкретной иконки Ant Design
    function loadAntdIcon(placeholder, iconName, iconPaths) {
        // Создаем SVG элемент для иконки
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        svg.setAttribute('viewBox', '0 0 1024 1024');
        svg.setAttribute('fill', 'currentColor');
        svg.style.color = '#666';
        
        // Создаем path элемент (базовая форма для большинства иконок Ant Design)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Получаем путь для иконки или используем дефолтный
        const iconPath = iconPaths[iconName] || iconPaths['default'] || 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z';
        path.setAttribute('d', iconPath);
        
        svg.appendChild(path);
        placeholder.innerHTML = '';
        placeholder.appendChild(svg);
    }
}