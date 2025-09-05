// Функциональность для страницы Material Design Icons с пагинацией

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('iconSearch');
    const iconsContainer = document.getElementById('iconsContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    let allIcons = [];
    let muiIconPaths = {};
    let paginatedIcons = null;

    init();

    async function init() {
        await loadMuiIconPaths();
        setupPaginatedIcons();
        initSearch();
        updateResultsCount(allIcons.length);
    }

    async function loadMuiIconPaths() {
        try {
            const baseUrl = window.baseUrl || '';
            const response = await fetch(`${baseUrl}/js/mui-icon-paths.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            muiIconPaths = await response.json();
            
            // Преобразуем в массив объектов для пагинации
            allIcons = Object.keys(muiIconPaths).map(name => ({
                name,
                path: muiIconPaths[name]
            })).sort((a, b) => a.name.localeCompare(b.name));
            
            // Скрываем индикатор загрузки
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        } catch (error) {
            console.error("Ошибка при загрузке mui-icon-paths.json:", error);
            if (loadingIndicator) {
                loadingIndicator.innerHTML = '<div class="loading-spinner"></div>Ошибка загрузки иконок';
            }
        }
    }

    function setupPaginatedIcons() {
        if (!iconsContainer) return;

        paginatedIcons = new PaginatedIcons(iconsContainer, {
            itemsPerPage: 50, // 50 иконок на странице
            loadIcon: loadMuiIcon,
            copyIcon: copyIconName
        });

        paginatedIcons.setItems(allIcons);
    }

    function loadMuiIcon(placeholder, iconName, iconPath) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        svg.setAttribute('viewBox', '0 0 24 24'); // MUI uses 24x24 viewBox
        svg.setAttribute('fill', 'currentColor');
        svg.style.color = '#666';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', iconPath || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z');

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