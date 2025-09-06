/**
 * Модуль для Unicode иконок (рефакторированная версия)
 */

if (typeof UnicodeIconPage === 'undefined') {
class UnicodeIconPage extends IconPageBase {
    constructor(config) {
        super(config);
    }

    getAdditionalIconData(name, path) {
        // Для Unicode иконок path содержит объект с дополнительными данными
        if (typeof path === 'object' && path !== null) {
            return {
                char: path.char,
                code: path.code,
                range: path.range,
                description: path.description,
                searchText: `${name} ${path.char} ${path.range}`.toLowerCase()
            };
        }
        return {};
    }

    loadIcon(placeholder, iconName, iconData) {
        // Для Unicode иконок нам не нужно загружать SVG, символ уже отображается
        if (placeholder) {
            // Находим иконку по имени для получения символа
            const icon = this.allIcons.find(i => i.name === iconName);
            if (icon && icon.char) {
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
            }
        }
    }

    filterIcon(icon, query) {
        // Для Unicode иконок используем расширенный поиск
        if (icon.searchText) {
            return icon.searchText.includes(query.toLowerCase());
        }
        return icon.name.toLowerCase().includes(query.toLowerCase());
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    if (window.iconPageConfig && window.iconPageConfig.platform === 'unicode') {
        new UnicodeIconPage(window.iconPageConfig);
    }
});
}
