/**
 * Модуль для Ant Design иконок (рефакторированная версия)
 */

class AntdIconPage extends IconPageBase {
    constructor(config) {
        super(config);
    }

    loadIcon(placeholder, iconName, iconPath) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        svg.setAttribute('viewBox', '0 0 1024 1024');
        svg.setAttribute('fill', 'currentColor');
        svg.style.color = '#666';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', iconPath || 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z');

        svg.appendChild(path);
        placeholder.innerHTML = '';
        placeholder.appendChild(svg);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    if (window.iconPageConfig && window.iconPageConfig.platform === 'antd') {
        new AntdIconPage(window.iconPageConfig);
    }
});
