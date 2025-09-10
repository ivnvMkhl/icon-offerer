# Icon Offerer

AI-поиск иконок по словесному запросу. Поддерживает Ant Design, Material Design и Unicode иконки.

🌐 **Демо**: [https://ivnvMkhl.github.io/icon-offerer](https://ivnvMkhl.github.io/icon-offerer)

## Возможности

- 🤖 AI-поиск иконок по естественному языку
- 🎨 Поддержка Ant Design, Material Design и Unicode иконок
- 📋 Копирование кода одним кликом
- 📱 Адаптивный дизайн с темной/светлой темой

## Установка

```bash
git clone https://github.com/ivnvMkhl/icon-offerer.git
cd icon-offerer
npm install
npm run dev
```

## Переменные окружения

Для продакшен сборки будет требоваться переменная `BASE_URL`.

Добавьте переменную `AI_SEARCH_URL` полный URL до функции AI поиска [репозиторий](https://github.com/ivnvMkhl/icon-offerer-cf) с кодом функции.

## CI/CD

Добавлен GitHub Actions workflow для деплоя проекта на GithubPages. 
Для корректной работы workflow требудется секрет `BASE_URL` и `AI_SEARCH_URL`.

## Использование

1. Выберите библиотеку иконок (Ant Design, Material Design или Unicode)
2. Введите запрос на естественном языке (например, "иконка поиска", "стрелка влево")
3. Скопируйте код иконки одним кликом

## Команды

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для продакшена
- `npm run extract-icons` - извлечение иконок из npm пакетов