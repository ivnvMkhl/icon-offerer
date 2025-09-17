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
        this.paginatedIcons = new PaginatedIcons(this.iconsContainer);
        this.api = new API();
        this.logger = new Logger();
        
        this.init();
    }


    async init() {
        try {
            // Предварительно рендерим контейнер с правильным количеством skeleton элементов
            this.preRenderIconContainer();
            
            // Загружаем данные иконок
            this.logger.log(`Начинаем загрузку иконок для платформы: ${this.platform}`);
            
            const result = await this.api.getPlatformIconPaths(this.platform);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            this.allIcons = result.mappedIcons; // Используем готовые маппированные данные
            this.logger.log(`Успешно загружено ${this.allIcons.length} иконок для платформы ${this.platform}`);
            
            // После успешной загрузки данных заменяем skeleton на реальные иконки
            this.setupPaginatedIcons();
            this.initSearch();
            
        } catch (error) {
            this.logger.error('Ошибка при инициализации:', error);
            this.handleLoadError();
        } finally {
            // Скрываем индикатор загрузки в любом случае
            this.hideLoadingIndicator();
        }
    }


    hideLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }


    handleLoadError() {
        this.hideLoadingIndicator();
        
        // Показываем сообщение об ошибке в контейнере иконок
        if (this.iconsContainer) {
            this.iconsContainer.innerHTML = `
                <div class="error-message">
                    <h3>Не удалось загрузить иконки</h3>
                    <p>Попробуйте обновить страницу или обратитесь к администратору</p>
                    <button onclick="location.reload()" class="retry-button">Обновить страницу</button>
                </div>
            `;
        }
    }

    preRenderIconContainer() {
        // Создаем skeleton loading для предотвращения CLS с правильным количеством элементов
        if (this.iconsContainer) {
            const skeletonCount = window.appConfig.perPage;
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

        this.paginatedIcons = new PaginatedIcons(this.iconsContainer, {
            itemsPerPage: window.appConfig.perPage,
            platform: this.platform,
            enableAISearch: true,
            loadIcon: this.loadIcon.bind(this),
            copyIcon: this.copyIcon.bind(this),
            noResultsElement: this.noResults
        });

        this.paginatedIcons.setItems(this.allIcons);
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
                icon.name.toLowerCase().includes(query.toLowerCase())
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

