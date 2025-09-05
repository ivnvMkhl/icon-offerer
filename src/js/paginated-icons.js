/**
 * Пагинированный список иконок для оптимизации производительности
 */
class PaginatedIcons {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemsPerPage: 50, // Количество иконок на странице
      urlParamName: 'page', // Имя параметра URL для страницы
      ...options
    };
    
    this.items = [];
    this.filteredItems = [];
    this.currentPage = 1;
    this.totalPages = 0;
    
    this.init();
  }
  
  init() {
    this.setupContainer();
    this.setupPagination();
    this.loadStateFromURL();
    this.setupURLListener();
  }
  
  setupContainer() {
    this.container.style.position = 'relative';
    
    // Создаем контейнер для иконок
    this.iconsContainer = document.createElement('div');
    this.iconsContainer.className = 'icons-grid';
    this.iconsContainer.style.margin = '2rem 0';
    this.container.appendChild(this.iconsContainer);
    
    // Создаем контейнер для пагинации
    this.paginationContainer = document.createElement('div');
    this.paginationContainer.className = 'pagination-container';
    this.paginationContainer.style.marginTop = '20px';
    this.paginationContainer.style.textAlign = 'center';
    this.container.appendChild(this.paginationContainer);
  }
  
  setupPagination() {
    this.paginationContainer.innerHTML = `
      <div class="pagination">
        <button class="pagination-btn" id="prevBtn" disabled>← Назад</button>
        <span class="pagination-info" id="paginationInfo">Страница 1 из 1</span>
        <button class="pagination-btn" id="nextBtn" disabled>Вперед →</button>
      </div>
    `;
    
    // Изначально скрываем контролы пагинации
    this.paginationContainer.style.display = 'none';
    
    // Обработчики кнопок
    const prevBtn = this.paginationContainer.querySelector('#prevBtn');
    const nextBtn = this.paginationContainer.querySelector('#nextBtn');
    
    prevBtn.addEventListener('click', () => this.previousPage());
    nextBtn.addEventListener('click', () => this.nextPage());
  }
  
  setItems(items) {
    this.items = items;
    this.filteredItems = [...items];
    
    // Загружаем состояние из URL перед установкой страницы
    this.loadStateFromURL();
    
    this.totalPages = Math.ceil(this.filteredItems.length / this.options.itemsPerPage);
    
    // Проверяем, что текущая страница не превышает общее количество страниц
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
      this.updateURL();
    }
    
    this.render();
  }
  
  filterItems(filterFn) {
    this.filteredItems = this.items.filter(filterFn);
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredItems.length / this.options.itemsPerPage);
    this.updateURL(); // Сбрасываем URL при фильтрации
    this.render();
  }
  
  render() {
    this.renderIcons();
    this.updatePagination();
  }
  
  renderIcons() {
    this.iconsContainer.innerHTML = '';
    
    const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
    const endIndex = Math.min(startIndex + this.options.itemsPerPage, this.filteredItems.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.filteredItems[i];
      if (item) {
        const iconCard = this.createIconCard(item, i);
        this.iconsContainer.appendChild(iconCard);
      }
    }
  }
  
  createIconCard(item, index) {
    const iconCard = document.createElement('div');
    iconCard.classList.add('icon-card');
    iconCard.dataset.name = item.name;

    iconCard.innerHTML = `
      <div class="icon-preview">
        <div class="icon-placeholder" data-icon="${item.name}">
          <!-- Иконка будет загружена через JavaScript -->
        </div>
      </div>
      <div class="icon-info">
        <div class="icon-name">${item.name}</div>
      </div>
      <div class="icon-actions">
        <button class="copy-btn" data-icon="${item.name}" title="Копировать название">
          <span class="copy-text">Копировать</span>
        </button>
      </div>
    `;

    // Загружаем SVG иконку
    if (this.options.loadIcon) {
      this.options.loadIcon(iconCard.querySelector('.icon-placeholder'), item.name, item.path);
    }

    // Добавляем обработчик копирования для кнопки
    const copyBtn = iconCard.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.options.copyIcon) {
          this.options.copyIcon(item.name, copyBtn);
        }
      });
    }

    // Добавляем обработчик копирования для всей карточки
    iconCard.addEventListener('click', (e) => {
      // Не копируем, если кликнули по кнопке (она уже обрабатывает клик)
      if (e.target.closest('.copy-btn')) {
        return;
      }
      
      if (this.options.copyIcon) {
        this.options.copyIcon(item.name, copyBtn);
      }
    });

    return iconCard;
  }
  
  updatePagination() {
    // Скрываем контролы пагинации, если элементов меньше чем itemsPerPage
    if (this.filteredItems.length <= this.options.itemsPerPage) {
      this.paginationContainer.style.display = 'none';
      return;
    }
    
    // Показываем контролы пагинации
    this.paginationContainer.style.display = 'block';
    
    const prevBtn = this.paginationContainer.querySelector('#prevBtn');
    const nextBtn = this.paginationContainer.querySelector('#nextBtn');
    const paginationInfo = this.paginationContainer.querySelector('#paginationInfo');
    
    prevBtn.disabled = this.currentPage <= 1;
    nextBtn.disabled = this.currentPage >= this.totalPages;
    
    paginationInfo.textContent = `Страница ${this.currentPage} из ${this.totalPages}`;
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateURL();
      this.render();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateURL();
      this.render();
    }
  }
  
  getCurrentPage() {
    return this.currentPage;
  }
  
  getTotalPages() {
    return this.totalPages;
  }
  
  getVisibleItems() {
    const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
    const endIndex = Math.min(startIndex + this.options.itemsPerPage, this.filteredItems.length);
    return this.filteredItems.slice(startIndex, endIndex);
  }

  // Методы для работы с URL
  loadStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get(this.options.urlParamName);
    
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      if (page > 0) {
        this.currentPage = page;
      }
    }
  }

  updateURL() {
    const url = new URL(window.location);
    
    if (this.currentPage > 1) {
      url.searchParams.set(this.options.urlParamName, this.currentPage.toString());
    } else {
      url.searchParams.delete(this.options.urlParamName);
    }
    
    // Обновляем URL без перезагрузки страницы
    window.history.replaceState({}, '', url);
  }

  setupURLListener() {
    // Слушаем изменения в истории браузера (кнопки назад/вперед)
    window.addEventListener('popstate', () => {
      this.loadStateFromURL();
      this.render();
    });
  }
}

// Экспортируем для использования в других модулях
window.PaginatedIcons = PaginatedIcons;
