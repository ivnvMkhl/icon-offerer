// Функциональность для страницы Ant Design Icons

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('iconSearch');
    const iconsGrid = document.getElementById('iconsGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    const iconCards = document.querySelectorAll('.icon-card');
    const copyButtons = document.querySelectorAll('.copy-btn');

    // Инициализация
    initSearch();
    initCopyButtons();
    loadIcons();
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
        textElement.textContent = 'Скопировано!';
        
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
    function loadIcons() {
        const iconPlaceholders = document.querySelectorAll('.icon-placeholder');
        
        iconPlaceholders.forEach(placeholder => {
            const iconName = placeholder.dataset.icon;
            if (iconName) {
                loadAntdIcon(placeholder, iconName);
            }
        });
    }

    // Загрузка конкретной иконки Ant Design
    function loadAntdIcon(placeholder, iconName) {
        // Создаем SVG элемент для иконки
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 1024 1024');
        svg.setAttribute('fill', 'currentColor');
        svg.style.color = '#1890ff';
        
        // Создаем path элемент (базовая форма для большинства иконок Ant Design)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Простые SVG пути для разных типов иконок
        const iconPaths = {
            'home': 'M946.5 505L534.6 93.4a31.93 31.93 0 0 0-45.2 0L77.5 505c-12 12-18.8 28.3-18.8 45.3 0 35.3 28.7 64 64 64h43.4v908h896V614h43.4c17 0 33.3-6.7 45.3-18.8 24.9-25 24.9-65.5-.1-90.5zM384 896V636h256v260H384z',
            'user': 'M858.5 763.6c-18.9-44.8-46.1-85-80.6-119.5-34.5-34.5-74.7-61.6-119.5-80.6-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 19-85 46.1-119.5 80.6-34.5 34.5-61.6 74.7-80.6 119.5C146.9 807.5 137 854 136 901.8c-.1 4.5 3.5 8.2 8 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.3 3.6 7.8 8 7.8h60c4.5 0 8-3.7 8-8.2-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362s17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362s-17.9 89.1-50.4 121.6S557.9 534 512 534z',
            'setting': 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z',
            'search': 'M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1 56.6 56.7 132 87.9 212.1 87.9 67 0 130.6-21.8 182.7-62l259.7 259.7a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116 65.6-158.4C296 211.3 352.2 188 412 188s116 23.3 158.4 65.6C612.7 296 636 352.2 636 412s-23.3 116-65.6 158.4z',
            'heart': 'M923 283.6c-13.4-31.1-32.6-58.9-56.9-82.8-24.3-23.8-52.5-42.4-84-55.5-32.5-13.1-66.9-19.6-102-19.6-35.1 0-69.5 6.5-102 19.6-31.5 13.1-59.7 31.7-84 55.5-24.3 23.8-43.5 51.7-56.9 82.8-13.4 31.1-20.1 64.2-20.1 98.6 0 34.4 6.7 67.5 20.1 98.6 13.4 31.1 32.6 58.9 56.9 82.8 24.3 23.8 52.5 42.4 84 55.5 32.5 13.1 66.9 19.6 102 19.6 35.1 0 69.5-6.5 102-19.6 31.5-13.1 59.7-31.7 84-55.5 24.3-23.8 43.5-51.7 56.9-82.8 13.4-31.1 20.1-64.2 20.1-98.6 0-34.4-6.7-67.5-20.1-98.6zM512 858.5c-7.4 0-14.7-2.8-20.3-8.3L166.4 530.5c-11-11-11-28.8 0-39.8s28.8-11 39.8 0L512 800.2l305.8-309.5c11-11 28.8-11 39.8 0s11 28.8 0 39.8L532.3 850.2c-5.6 5.5-12.9 8.3-20.3 8.3z',
            'star': 'M512 64l128 256 256 128-256 128-128 256-128-256L64 448l256-128L512 64z',
            'mail': 'M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 110.8V792H136V270.8l312 208 312-208zM512 354L136 192h752L512 354z',
            'phone': 'M877.1 238.7L640.1 1.7c-3.1-3.1-8.2-3.1-11.3 0L401.3 229.1c-3.1 3.1-3.1 8.2 0 11.3l235.8 237c3.1 3.1 8.2 3.1 11.3 0L877.1 250c3.1-3.1 3.1-8.2 0-11.3zM512 512c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z',
            'calendar': 'M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zm0-448H184V276h656v116z'
        };
        
        // Получаем путь для иконки или используем дефолтный
        const iconPath = iconPaths[iconName] || iconPaths['setting'];
        path.setAttribute('d', iconPath);
        
        svg.appendChild(path);
        placeholder.innerHTML = '';
        placeholder.appendChild(svg);
    }
});
