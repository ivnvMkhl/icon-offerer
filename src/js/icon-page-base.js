/**
 * Базовый модуль для страниц иконок
 * Содержит общую функциональность для всех платформ
 */

import { PaginatedIcons } from "./paginated-icons.js";
import { API } from "./api.js";
import { Logger } from "./logger.js";


export class IconPageBase {
    constructor(platform) {
        this.platform = platform;
        this.searchInput = document.getElementById('iconSearch');
        this.iconsContainer = document.getElementById('iconsContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.noResults = document.getElementById('noResults');
        this.aiMessagesContainer = document.getElementById('aiMessagesContainer');
        
        this.allIcons = [];
        this.iconPaths = {};
        this.paginatedIcons = new PaginatedIcons(this.iconsContainer);
        this.api = new API();
        this.logger = new Logger();
        
        this.init();
    }

    async init() {
        // Вычисляем оптимальное количество элементов до рендеринга
        this.optimalItemsPerPage = this.calculateItemsPerPage();
        
        // Предварительно рендерим контейнер с правильным количеством skeleton элементов
        this.preRenderIconContainer();
        await this.loadIconPaths();
        // После загрузки данных заменяем skeleton на реальные иконки
        this.setupPaginatedIcons();
        this.initSearch();
        this.setupResizeHandler();
    }

    async loadIconPaths() {
        try {
            const result = await this.api.getPlatformIconPaths(this.platform);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            this.iconPaths = result.data;
            
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
            this.logger.error(`Ошибка при загрузке иконок для платформы ${this.platform}:`, error);
            if (this.loadingIndicator) {
                this.loadingIndicator.innerHTML = '<div class="loading-spinner"></div>Ошибка загрузки иконок';
            }
        }
    }

    getAdditionalIconData(name, path) {
        // Переопределяется в дочерних классах
        return {};
    }

    preRenderIconContainer() {
        // Создаем skeleton loading для предотвращения CLS с правильным количеством элементов
        if (this.iconsContainer) {
            const skeletonCount = this.optimalItemsPerPage || 12; // fallback на 12 если не вычислено
            this.iconsContainer.innerHTML = `
                <div class="icons-grid" id="iconsGrid">
                    ${Array.from({ length: skeletonCount }, () => `
                        <div class="icon-card">
                            <div class="icon-preview">
                                <div class="icon-placeholder"></div>
                            </div>
                            <div class="icon-info">
                                <div class="icon-name skeleton"></div>
                            </div>
                            <div class="icon-actions">
                                <div class="copy-btn skeleton"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    setupPaginatedIcons() {
        if (!this.iconsContainer) return;

        // Очищаем skeleton элементы перед созданием реальных иконок
        this.iconsContainer.innerHTML = '';

        // Используем предварительно вычисленное количество элементов
        const itemsPerPage = this.optimalItemsPerPage || this.calculateItemsPerPage();

        this.paginatedIcons = new PaginatedIcons(this.iconsContainer, {
            itemsPerPage: itemsPerPage,
            platform: this.platform,
            enableAISearch: true,
            loadIcon: this.loadIcon.bind(this),
            copyIcon: this.copyIcon.bind(this),
            noResultsElement: this.noResults
        });

        this.paginatedIcons.setItems(this.allIcons);
    }

    calculateItemsPerPage() {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        
        // Создаем временный контейнер для точного измерения
        const tempContainer = this.createMeasurementContainer();
        document.body.appendChild(tempContainer);
        
        try {
            // Получаем реальные размеры элементов
            const header = tempContainer.querySelector('.header');
            const searchSection = tempContainer.querySelector('.search-section');
            const paginationContainer = tempContainer.querySelector('.pagination-container');
            const main = tempContainer.querySelector('.main');
            
            // Вычисляем высоту header + search
            let headerHeight = 0;
            if (header) headerHeight += header.offsetHeight;
            if (searchSection) headerHeight += searchSection.offsetHeight;
            
            // Вычисляем высоту пагинации
            let paginationHeight = 0;
            if (paginationContainer) {
                paginationHeight = paginationContainer.offsetHeight + 20; // + margin
            }
            
            // Вычисляем padding main
            let mainPadding = 0;
            if (main) {
                const computedStyle = window.getComputedStyle(main);
                mainPadding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
            }
            
            // Доступная высота для иконок
            const availableHeight = windowHeight - headerHeight - paginationHeight - mainPadding - 40;
            
            // Получаем реальную ширину контейнера
            const container = tempContainer.querySelector('.container');
            const containerWidth = container ? container.offsetWidth : windowWidth;
            
            // Вычисляем размеры карточек в зависимости от размера экрана
            let iconCardWidth, iconCardHeight, gap;
            if (windowWidth >= 1200) {
                iconCardWidth = 180;
                iconCardHeight = 140;
                gap = 12;
            } else if (windowWidth >= 768) {
                iconCardWidth = 160;
                iconCardHeight = 140;
                gap = 12;
            } else if (windowWidth >= 480) {
                iconCardWidth = 130;
                iconCardHeight = 140;
                gap = 10;
            } else {
                iconCardWidth = 100;
                iconCardHeight = 120;
                gap = 8;
            }
            
            // Вычисляем количество колонок и строк
            const columns = Math.floor(containerWidth / (iconCardWidth + gap));
            const rows = Math.floor(availableHeight / (iconCardHeight + gap));
            
            // Ограничиваем разумными пределами
            const itemsPerPage = Math.max(6, Math.min(rows * columns, 100));
            
            this.logger.info(`Адаптивная пагинация: ${windowWidth}x${windowHeight} -> контейнер: ${containerWidth}px, ${columns} колонок, ${rows} строк, ${itemsPerPage} элементов на странице (доступная высота: ${availableHeight}px)`);
            
            return itemsPerPage;
        } finally {
            // Удаляем временный контейнер
            document.body.removeChild(tempContainer);
        }
    }

    createMeasurementContainer() {
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-9999px';
        tempContainer.style.left = '-9999px';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.width = window.innerWidth + 'px';
        tempContainer.innerHTML = `
            <div class="header">
                <nav class="nav">
                    <a href="#" class="nav__logo">icon-offerer</a>
                </nav>
            </div>
            <div class="search-section">
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="Найти по имени или вопрос AI">
                    <button class="ai-search-button">
                        <span class="ai-search-text">Спросить AI</span>
                    </button>
                </div>
            </div>
            <div class="pagination-container">
                <div class="pagination">
                    <div class="pagination-left">
                        <span class="pagination-info">1-50 из 1000</span>
                    </div>
                    <div class="pagination-center">
                        <button class="pagination-btn" data-action="prev">←</button>
                        <button class="pagination-btn active">1</button>
                        <button class="pagination-btn" data-action="next">→</button>
                    </div>
                </div>
            </div>
            <div class="main">
                <div class="container"></div>
            </div>
        `;
        return tempContainer;
    }


    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // Дебаунсим обработчик resize для производительности
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.paginatedIcons) {
                    // Пересчитываем оптимальное количество элементов
                    this.optimalItemsPerPage = this.calculateItemsPerPage();
                    const newItemsPerPage = this.optimalItemsPerPage;
                    
                    if (newItemsPerPage !== this.paginatedIcons.options.itemsPerPage) {
                        this.logger.log(`Ресайз: изменяем itemsPerPage с ${this.paginatedIcons.options.itemsPerPage} на ${newItemsPerPage}`);
                        
                        this.paginatedIcons.options.itemsPerPage = newItemsPerPage;
                        
                        // Пересчитываем общее количество страниц
                        this.paginatedIcons.totalPages = Math.ceil(this.paginatedIcons.filteredItems.length / newItemsPerPage);
                        
                        this.logger.log(`Ресайз: новое количество страниц: ${this.paginatedIcons.totalPages} (элементов: ${this.paginatedIcons.filteredItems.length})`);
                        
                        // Проверяем, что текущая страница не превышает новое количество страниц
                        if (this.paginatedIcons.currentPage > this.paginatedIcons.totalPages) {
                            this.paginatedIcons.currentPage = Math.max(1, this.paginatedIcons.totalPages);
                            this.paginatedIcons.updateURL();
                            this.logger.log(`Ресайз: корректируем текущую страницу на ${this.paginatedIcons.currentPage}`);
                        }
                        
                        this.paginatedIcons.renderIcons();
                        this.paginatedIcons.updatePagination();
                    }
                }
            }, 250);
        });
    }

    loadIcon(placeholder, iconName, iconPath) {
        // Переопределяется в дочерних классах
        this.logger.warn('loadIcon не реализован для платформы:', this.platform);
    }

    copyIcon(iconName, button) {
        // Общая функция копирования
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(iconName)
                .then(() => {
                    this.showCopySuccess(button);
                })
                .catch(err => {
                    this.logger.error('Не удалось скопировать текст: ', err);
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
            this.logger.error('Fallback: Не удалось скопировать текст: ', err);
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

        // AI поиск по клавише Enter
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performAISearch();
            }
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
            this.logger.error('Ошибка AI поиска:', error);
            alert('Произошла ошибка при выполнении AI поиска');
        } finally {
            // Восстанавливаем кнопку
            aiSearchButton.disabled = false;
            aiSearchButton.classList.remove('loading');
            aiSearchText.textContent = originalText;
        }
    }
}

