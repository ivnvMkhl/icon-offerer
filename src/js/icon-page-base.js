/**
 * Базовый модуль для страниц иконок
 * Содержит общую функциональность для всех платформ
 */

class IconPageBase {
    constructor(config) {
        this.config = config;
        this.searchInput = document.getElementById('iconSearch');
        this.iconsContainer = document.getElementById('iconsContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.noResults = document.getElementById('noResults');
        this.aiMessagesContainer = document.getElementById('aiMessagesContainer');
        
        this.allIcons = [];
        this.iconPaths = {};
        this.paginatedIcons = null;
        
        this.init();
    }

    async init() {
        await this.loadIconPaths();
        this.setupPaginatedIcons();
        this.initSearch();
    }

    async loadIconPaths() {
        try {
            const baseUrl = window.baseUrl || '';
            const response = await fetch(`${baseUrl}/js/${this.config.dataFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.iconPaths = await response.json();
            
            // Преобразуем в массив объектов для пагинации
            this.allIcons = Object.keys(this.iconPaths).map(name => ({
                name,
                path: this.iconPaths[name],
                ...this.getAdditionalIconData(name, this.iconPaths[name])
            })).sort((a, b) => a.name.localeCompare(b.name));
            
            // Скрываем индикатор загрузки
            if (this.loadingIndicator) {
                this.loadingIndicator.style.display = 'none';
            }
        } catch (error) {
            console.error(`Ошибка при загрузке ${this.config.dataFile}:`, error);
            if (this.loadingIndicator) {
                this.loadingIndicator.innerHTML = '<div class="loading-spinner"></div>Ошибка загрузки иконок';
            }
        }
    }

    getAdditionalIconData(name, path) {
        // Переопределяется в дочерних классах
        return {};
    }

    setupPaginatedIcons() {
        if (!this.iconsContainer) return;

        this.paginatedIcons = new PaginatedIcons(this.iconsContainer, {
            itemsPerPage: 50,
            platform: this.config.platform,
            enableAISearch: true,
            loadIcon: this.loadIcon.bind(this),
            copyIcon: this.copyIcon.bind(this),
            noResultsElement: this.noResults
        });

        this.paginatedIcons.setItems(this.allIcons);
    }

    loadIcon(placeholder, iconName, iconPath) {
        // Переопределяется в дочерних классах
        console.warn('loadIcon не реализован для платформы:', this.config.platform);
    }

    copyIcon(iconName, button) {
        // Общая функция копирования
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(iconName)
                .then(() => {
                    this.showCopySuccess(button);
                })
                .catch(err => {
                    console.error('Не удалось скопировать текст: ', err);
                    this.fallbackCopy(iconName, button);
                });
        } else {
            this.fallbackCopy(iconName, button);
        }
    }

    fallbackCopy(text, button) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            this.showCopySuccess(button);
        } catch (err) {
            console.error('Fallback: Не удалось скопировать текст: ', err);
        }
        document.body.removeChild(textArea);
    }

    showCopySuccess(button) {
        const originalText = button.querySelector('.copy-text').textContent;
        const textElement = button.querySelector('.copy-text');

        button.classList.add('copied');
        textElement.textContent = 'Скопировано';

        setTimeout(() => {
            button.classList.remove('copied');
            textElement.textContent = originalText;
        }, 2000);
    }

    initSearch() {
        if (!this.searchInput) return;

        // Обычный поиск по названию
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.filterIcons(query);
        });

        // AI поиск по кнопке
        const aiSearchButton = document.getElementById('aiSearchButton');
        if (aiSearchButton) {
            aiSearchButton.addEventListener('click', () => this.performAISearch());
        }
    }

    filterIcons(query) {
        if (!this.paginatedIcons) return;

        if (!query) {
            // Очищаем AI поиск если он был активен
            if (this.paginatedIcons.isInAISearchMode()) {
                this.paginatedIcons.clearAISearch();
            } else {
                // Принудительно скрываем AI контейнер
                if (this.aiMessagesContainer) {
                    this.aiMessagesContainer.style.display = 'none';
                }
            }
            this.paginatedIcons.setItems(this.allIcons);
            
            // Скрываем сообщение "не найдено" при очистке поля поиска
            if (this.noResults) {
                this.noResults.style.display = 'none';
            }
        } else {
            // Очищаем AI поиск если он был активен
            if (this.paginatedIcons.isInAISearchMode()) {
                this.paginatedIcons.clearAISearch();
            }
            
            // Обычный поиск по названию
            this.paginatedIcons.filterItems(icon => 
                this.filterIcon(icon, query)
            );
        }

        // Показываем/скрываем сообщение "не найдено" только если не в режиме AI поиска
        if (this.noResults && !this.paginatedIcons.isInAISearchMode()) {
            if (this.paginatedIcons.filteredItems.length === 0) {
                this.noResults.style.display = 'block';
            } else {
                this.noResults.style.display = 'none';
            }
        }
    }

    filterIcon(icon, query) {
        // Переопределяется в дочерних классах для специфичной логики поиска
        return icon.name.toLowerCase().includes(query.toLowerCase());
    }

    async performAISearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            alert('Введите описание иконки для AI поиска');
            return;
        }

        if (query.length < 3) {
            alert('Запрос должен содержать минимум 3 символа');
            return;
        }

        if (!this.paginatedIcons) return;

        const aiSearchButton = document.getElementById('aiSearchButton');
        const aiSearchText = aiSearchButton.querySelector('.ai-search-text');
        const originalText = aiSearchText.textContent;

        try {
            // Скрываем сообщение "не найдено" при начале AI поиска
            if (this.noResults) {
                this.noResults.style.display = 'none';
            }
            
            // Показываем состояние загрузки
            aiSearchButton.disabled = true;
            aiSearchButton.classList.add('loading');
            aiSearchText.textContent = 'AI думает';

            const success = await this.paginatedIcons.performAISearch(query);
            
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
}

// Экспортируем класс для использования в других модулях
window.IconPageBase = IconPageBase;
