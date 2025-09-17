/**
 * Модуль для Unicode иконок (рефакторированная версия)
 */

import { IconPageBase } from './icon-page-base.js';

class UnicodeIconPage extends IconPageBase {
    constructor() {
        super('unicode');
    }


    loadIcon(placeholder, iconName, iconData) {
        // Для Unicode иконок нам не нужно загружать SVG, символ уже отображается
        if (placeholder) {
            // Находим иконку по имени для получения символа
            const icon = this.allIcons.find(i => i.name === iconName);
            if (icon && icon.char) {
                // Плавная загрузка для предотвращения CLS
                placeholder.style.opacity = '0';
                placeholder.style.transition = 'opacity 0.3s ease';
                
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
                
                // Плавное появление символа
                requestAnimationFrame(() => {
                    placeholder.style.opacity = '1';
                });
            }
        }
    }

}

new UnicodeIconPage();
