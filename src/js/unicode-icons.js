/**
 * JavaScript для страницы Unicode иконок
 */

let unicodeIcons = [];
let paginatedIcons = null;

// Загружаем данные Unicode иконок
async function loadUnicodeIconPaths() {
  try {
    const baseUrl = window.baseUrl || '';
    const response = await fetch(`${baseUrl}/js/unicode-icon-paths.json`);
    const data = await response.json();
    
    // Преобразуем данные в формат, подходящий для пагинации
    unicodeIcons = Object.entries(data).map(([unicodeName, iconData]) => ({
      name: unicodeName,
      char: iconData.char,
      code: iconData.code,
      range: iconData.range,
      description: iconData.description,
      searchText: `${unicodeName} ${iconData.char} ${iconData.range}`.toLowerCase()
    }));
    
    console.log(`Загружено ${unicodeIcons.length} Unicode иконок`);
    return unicodeIcons;
  } catch (error) {
    console.error('Ошибка загрузки Unicode иконок:', error);
    return [];
  }
}

// Функция для отрисовки карточки иконки
function renderUnicodeIconCard(icon) {
  const iconCard = document.createElement('div');
  iconCard.className = 'icon-card';
  
  // Создаем структуру карточки
  const iconPreview = document.createElement('div');
  iconPreview.className = 'icon-preview';
  
  const iconPlaceholder = document.createElement('div');
  iconPlaceholder.className = 'icon-placeholder unicode-icon';
  
  // Отладочная информация
  console.log(`Рендерим Unicode иконку: ${icon.name} = ${icon.char}`);
  
  // Символ будет установлен в loadUnicodeIcon
  // Пока оставляем placeholder пустым
  
  iconPreview.appendChild(iconPlaceholder);
  
  const iconInfo = document.createElement('div');
  iconInfo.className = 'icon-info';
  
  const iconName = document.createElement('div');
  iconName.className = 'icon-name';
  iconName.textContent = icon.name;
  
  const iconDescription = document.createElement('div');
  iconDescription.className = 'icon-description';
  iconDescription.textContent = icon.range;
  
  iconInfo.appendChild(iconName);
  iconInfo.appendChild(iconDescription);
  
  const iconActions = document.createElement('div');
  iconActions.className = 'icon-actions';
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.setAttribute('data-icon', icon.name);
  copyBtn.setAttribute('title', 'Копировать Unicode код');
  
  const copyText = document.createElement('span');
  copyText.className = 'copy-text';
  copyText.textContent = 'Копировать';
  
  copyBtn.appendChild(copyText);
  iconActions.appendChild(copyBtn);
  
  // Собираем карточку
  iconCard.appendChild(iconPreview);
  iconCard.appendChild(iconInfo);
  iconCard.appendChild(iconActions);
  
  return iconCard;
}

// Функция для загрузки Unicode иконки (просто отображаем символ)
function loadUnicodeIcon(placeholder, iconName, iconPath) {
  // Для Unicode иконок нам не нужно загружать SVG, символ уже отображается
  // Но мы можем добавить дополнительную информацию
  if (placeholder) {
    // Находим иконку по имени для получения символа
    const icon = unicodeIcons.find(i => i.name === iconName);
    if (icon) {
      // Устанавливаем символ в placeholder
      placeholder.innerHTML = icon.char;
      placeholder.title = `${iconName}: ${icon.char}`;
      
      // Добавляем инлайн стили для гарантии отображения
      placeholder.style.fontSize = '24px';
      placeholder.style.color = '#1a1a1a';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.minWidth = '32px';
      placeholder.style.minHeight = '32px';
      
      console.log(`Загружена Unicode иконка: ${iconName} = ${icon.char}`);
    } else {
      console.warn(`Не найдена иконка с именем: ${iconName}`);
    }
  }
}

// Функция для копирования Unicode кода
function copyUnicodeCode(iconName, button) {
  const textToCopy = iconName; // Копируем Unicode код (например, U+2600)
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    // Визуальная обратная связь
    const originalText = button.querySelector('.copy-text').textContent;
    button.querySelector('.copy-text').textContent = 'Скопировано';
    button.style.background = '#f0f0f0';
    button.style.color = '#666';
    
    setTimeout(() => {
      button.querySelector('.copy-text').textContent = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 2000);
  }).catch(err => {
    console.error('Ошибка копирования:', err);
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Визуальная обратная связь
    const originalText = button.querySelector('.copy-text').textContent;
    button.querySelector('.copy-text').textContent = 'Скопировано';
    button.style.background = '#f0f0f0';
    button.style.color = '#666';
    
    setTimeout(() => {
      button.querySelector('.copy-text').textContent = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 2000);
  });
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM загружен, начинаем инициализацию Unicode иконок');
  
  const container = document.getElementById('iconsContainer');
  const loadingIndicator = document.getElementById('loadingIndicator');
  
  if (!container) {
    console.error('Контейнер для иконок не найден');
    return;
  }
  
  console.log('Контейнер найден:', container);
  
  try {
    console.log('Начинаем загрузку Unicode иконок...');
    
    // Загружаем данные Unicode иконок
    await loadUnicodeIconPaths();
    
    console.log(`Загружено ${unicodeIcons.length} Unicode иконок`);
    
    if (unicodeIcons.length === 0) {
      console.error('Не удалось загрузить Unicode иконки');
      container.innerHTML = '<p>Не удалось загрузить Unicode иконки</p>';
      return;
    }
    
    // Скрываем индикатор загрузки
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // Проверяем, что PaginatedIcons доступен
    console.log('Проверяем доступность PaginatedIcons...');
    if (typeof PaginatedIcons === 'undefined') {
      console.error('PaginatedIcons не определен. Убедитесь, что paginated-icons.js загружен.');
      container.innerHTML = '<p>Ошибка загрузки компонента пагинации</p>';
      return;
    }
    
    console.log('PaginatedIcons доступен, создаем экземпляр...');
    
    // Инициализируем пагинацию
    paginatedIcons = new PaginatedIcons(container, {
      itemsPerPage: 50,
      renderItem: renderUnicodeIconCard,
      loadIcon: loadUnicodeIcon,
      copyIcon: copyUnicodeCode,
      resultsCountElement: document.getElementById('resultsCount'),
      noResultsElement: document.getElementById('noResults')
    });
    
    // Устанавливаем иконки
    paginatedIcons.setItems(unicodeIcons);
    
    // Настраиваем поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
          paginatedIcons.setItems(unicodeIcons);
        } else {
          paginatedIcons.filterItems(icon => 
            icon.searchText.includes(query)
          );
        }
      });
    }
    
    console.log('Unicode иконки успешно загружены и отображены');
    
  } catch (error) {
    console.error('Ошибка инициализации Unicode иконок:', error);
    container.innerHTML = '<p>Произошла ошибка при загрузке иконок</p>';
  }
});
