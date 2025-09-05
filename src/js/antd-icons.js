// Функциональность для страницы Ant Design Icons с пагинацией

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('iconSearch');
    const iconsContainer = document.getElementById('iconsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    let allIcons = [];
    let antdIconPaths = {};
    let paginatedIcons = null;

    init();

    async function init() {
        await loadAntdIconPaths();
        setupPaginatedIcons();
        initSearch();
        updateResultsCount(allIcons.length);
    }

    async function loadAntdIconPaths() {
        try {
            const baseUrl = window.baseUrl || '';
            const response = await fetch(`${baseUrl}/js/antd-icon-paths.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            antdIconPaths = await response.json();
            
            // Преобразуем в массив объектов для пагинации
            allIcons = Object.keys(antdIconPaths).map(name => ({
                name,
                path: antdIconPaths[name]
            })).sort((a, b) => a.name.localeCompare(b.name));
            
            // Скрываем индикатор загрузки
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        } catch (error) {
            console.error("Ошибка при загрузке antd-icon-paths.json:", error);
            if (loadingIndicator) {
                loadingIndicator.innerHTML = '<div class="loading-spinner"></div>Ошибка загрузки иконок';
            }
        }
    }

    function setupPaginatedIcons() {
        if (!iconsContainer) return;

        paginatedIcons = new PaginatedIcons(iconsContainer, {
            itemsPerPage: 50, // 50 иконок на странице
            loadIcon: loadAntdIcon,
            copyIcon: copyIconName
        });

        paginatedIcons.setItems(allIcons);
    }

    function loadAntdIcon(placeholder, iconName, iconPath) {
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

    function initSearch() {
        if (!searchInput) return;

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            filterIcons(query);
        });
    }

    function filterIcons(query) {
        if (!paginatedIcons) return;

        if (!query) {
            paginatedIcons.setItems(allIcons);
        } else {
            paginatedIcons.filterItems(icon => 
                icon.name.toLowerCase().includes(query)
            );
        }

        updateResultsCount(paginatedIcons.filteredItems.length);

        // Показываем/скрываем сообщение "не найдено"
        if (noResults) {
            if (paginatedIcons.filteredItems.length === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }
    }

    function updateResultsCount(count) {
        if (resultsCount) {
            resultsCount.innerHTML = `Найдено иконок: <strong>${count}</strong>`;
        }
    }

    function copyIconName(iconName, button) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(iconName)
                .then(() => {
                    showCopySuccess(button);
                })
                .catch(err => {
                    console.error('Не удалось скопировать текст: ', err);
                    fallbackCopy(iconName, button);
                });
        } else {
            fallbackCopy(iconName, button);
        }
    }

    function fallbackCopy(text, button) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showCopySuccess(button);
        } catch (err) {
            console.error('Fallback: Не удалось скопировать текст: ', err);
        }
        document.body.removeChild(textArea);
    }

    function showCopySuccess(button) {
        const originalText = button.querySelector('.copy-text').textContent;
        const textElement = button.querySelector('.copy-text');

        button.classList.add('copied');
        textElement.textContent = 'Скопировано';

        setTimeout(() => {
            button.classList.remove('copied');
            textElement.textContent = originalText;
        }, 2000);
    }
});