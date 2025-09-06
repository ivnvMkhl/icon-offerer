// Функциональность для страницы Material Design Icons с пагинацией

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('iconSearch');
    const iconsContainer = document.getElementById('iconsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    
    let allIcons = [];
    let muiIconPaths = {};
    let paginatedIcons = null;

    init();

    async function init() {
        await loadMuiIconPaths();
        setupPaginatedIcons();
        initSearch();
    }

    async function loadMuiIconPaths() {
        try {
            const baseUrl = window.baseUrl || '';
            const response = await fetch(`${baseUrl}/js/mui-icon-paths.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            muiIconPaths = await response.json();
            
            // Преобразуем в массив объектов для пагинации
            allIcons = Object.keys(muiIconPaths).map(name => ({
                name,
                path: muiIconPaths[name]
            })).sort((a, b) => a.name.localeCompare(b.name));
            
            // Скрываем индикатор загрузки
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        } catch (error) {
            console.error("Ошибка при загрузке mui-icon-paths.json:", error);
            if (loadingIndicator) {
                loadingIndicator.innerHTML = '<div class="loading-spinner"></div>Ошибка загрузки иконок';
            }
        }
    }

    function setupPaginatedIcons() {
        if (!iconsContainer) return;

        paginatedIcons = new PaginatedIcons(iconsContainer, {
            itemsPerPage: 50, // 50 иконок на странице
            platform: 'mui', // Платформа для AI поиска
            enableAISearch: true, // Включить AI поиск
            loadIcon: loadMuiIcon,
            copyIcon: copyIconName
        });

        paginatedIcons.setItems(allIcons);
    }

    function loadMuiIcon(placeholder, iconName, iconPath) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        svg.setAttribute('viewBox', '0 0 24 24'); // MUI uses 24x24 viewBox
        svg.setAttribute('fill', 'currentColor');
        svg.style.color = '#666';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', iconPath || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z');

        svg.appendChild(path);
        placeholder.innerHTML = '';
        placeholder.appendChild(svg);
    }

    function initSearch() {
        if (!searchInput) return;

        // Обычный поиск по названию
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            filterIcons(query);
        });

        // AI поиск по кнопке
        const aiSearchButton = document.getElementById('aiSearchButton');
        if (aiSearchButton) {
            aiSearchButton.addEventListener('click', performAISearch);
        }
    }

    function filterIcons(query) {
        if (!paginatedIcons) return;

        if (!query) {
            // Очищаем AI поиск если он был активен
            if (paginatedIcons.isInAISearchMode()) {
                paginatedIcons.clearAISearch();
            } else {
                // Принудительно скрываем AI контейнер даже если AI поиск не был активен
                const aiContainer = document.getElementById('aiMessagesContainer');
                if (aiContainer) {
                    aiContainer.style.display = 'none';
                }
            }
            paginatedIcons.setItems(allIcons);
            
            // Скрываем сообщение "не найдено" при очистке поля поиска
            if (noResults) {
                noResults.style.display = 'none';
            }
        } else {
            // Очищаем AI поиск если он был активен
            if (paginatedIcons.isInAISearchMode()) {
                paginatedIcons.clearAISearch();
            }
            
            // Обычный поиск по названию
            paginatedIcons.filterItems(icon => 
                icon.name.toLowerCase().includes(query.toLowerCase())
            );
        }


        // Показываем/скрываем сообщение "не найдено" только если не в режиме AI поиска
        if (noResults && !paginatedIcons.isInAISearchMode()) {
            if (paginatedIcons.filteredItems.length === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }
    }

    // Функция AI поиска
    async function performAISearch() {
        const query = searchInput.value.trim();
        
        if (!query) {
            alert('Введите описание иконки для AI поиска');
            return;
        }

        if (query.length < 3) {
            alert('Запрос должен содержать минимум 3 символа');
            return;
        }

        if (!paginatedIcons) return;

        const aiSearchButton = document.getElementById('aiSearchButton');
        const aiSearchText = aiSearchButton.querySelector('.ai-search-text');
        const originalText = aiSearchText.textContent;

        try {
            // Скрываем сообщение "не найдено" при начале AI поиска
            if (noResults) {
                noResults.style.display = 'none';
            }
            
            // Показываем состояние загрузки
            aiSearchButton.disabled = true;
            aiSearchButton.classList.add('loading');
            aiSearchText.textContent = 'AI думает';

            const success = await paginatedIcons.performAISearch(query);
            
            // Не показываем сообщение "не найдено" для AI поиска
            // AI поиск сам обрабатывает случаи отсутствия результатов
        } catch (error) {
            console.error('Ошибка AI поиска:', error);
            alert('Произошла ошибка при выполнении AI поиска');
        } finally {
            // Восстанавливаем кнопку
            aiSearchButton.disabled = false;
            aiSearchButton.classList.remove('loading');
            aiSearchText.textContent = originalText;
        }
    }


    function copyIconName(iconName, button) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(iconName)
                .then(() => {
                    showCopySuccess(button);
                })
                .catch(err => {
                    console.error('Не удалось скопировать текст: ', err);
                    fallbackCopy(iconName, button);
                });
        } else {
            fallbackCopy(iconName, button);
        }
    }

    function fallbackCopy(text, button) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showCopySuccess(button);
        } catch (err) {
            console.error('Fallback: Не удалось скопировать текст: ', err);
        }
        document.body.removeChild(textArea);
    }

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
});