/**
 * Модуль для переключения темы
 */

// Обновление кнопки переключения (только иконки)
function updateThemeToggle(theme) {
    // Иконки переключаются автоматически через CSS
}

// Переключение темы
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
}

// Инициализация кнопки при загрузке (тема уже установлена в head)
document.addEventListener('DOMContentLoaded', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateThemeToggle(currentTheme);
});

// Обработчик клика на кнопку
document.addEventListener('click', function(e) {
    if (e.target.closest('#themeToggle')) {
        toggleTheme();
    }
});

// Слушатель изменения системной темы
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeToggle(theme);
    }
});
