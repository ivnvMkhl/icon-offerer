(() => {
    const THEMES = ['light', 'dark'];

    const getNextTheme = (currentTheme) => {
        const currentIndex = THEMES.indexOf(currentTheme);
        return THEMES[(currentIndex + 1) % THEMES.length];
    };

    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = getNextTheme(currentTheme);

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
})();