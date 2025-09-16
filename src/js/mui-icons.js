/**
 * Модуль для Material Design иконок (рефакторированная версия)
 */

import { IconPageBase } from './icon-page-base.js';


class MuiIconPage extends IconPageBase {
    constructor() {
        super('mui');
    }

    loadIcon(placeholder, iconName, iconPath) {
        // Плавная загрузка иконки для предотвращения CLS
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        svg.setAttribute('viewBox', '0 0 24 24'); // MUI uses 24x24 viewBox
        svg.setAttribute('fill', 'currentColor');
        svg.style.color = '#666';
        svg.style.opacity = '0';
        svg.style.transition = 'opacity 0.3s ease';

        // Обрабатываем как один path, так и несколько path элементов
        if (iconPath && iconPath.includes('<path')) {
            // Если iconPath содержит HTML с path элементами, используем innerHTML
            svg.innerHTML = iconPath;
        } else {
            // Если iconPath содержит только d атрибут, создаем path элемент
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', iconPath || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z');
            svg.appendChild(path);
        }
        placeholder.innerHTML = '';
        placeholder.appendChild(svg);
        
        // Плавное появление иконки
        requestAnimationFrame(() => {
            svg.style.opacity = '1';
        });
    }
}

new MuiIconPage();
