/**
 * Модуль для Ant Design иконок (рефакторированная версия)
 */

if (typeof AntdIconPage === 'undefined') {
class AntdIconPage extends IconPageBase {
    constructor(config) {
        super(config);
    }

    loadIcon(placeholder, iconName, iconPath) {
        // Плавная загрузка иконки для предотвращения CLS
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        svg.setAttribute('viewBox', '0 0 1024 1024');
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
            path.setAttribute('d', iconPath || 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z');
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

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    if (window.iconPageConfig && window.iconPageConfig.platform === 'antd') {
        new AntdIconPage(window.iconPageConfig);
    }
});
}
