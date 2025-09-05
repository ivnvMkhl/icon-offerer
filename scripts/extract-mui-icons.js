const fs = require('fs');
const path = require('path');

// Путь к иконкам Material Design
const iconsPath = path.resolve('node_modules/@mui/icons-material');
const outputPathJson = path.resolve('dist/js/mui-icon-paths.json');

// Создаем директорию dist/js если её нет
const distJsDir = path.dirname(outputPathJson);
if (!fs.existsSync(distJsDir)) {
  fs.mkdirSync(distJsDir, { recursive: true });
}

// Получаем список всех файлов иконок
const iconFiles = fs.readdirSync(iconsPath)
  .filter(file => file.endsWith('.js') && !file.includes('.d.ts') && file !== 'index.js')
  .sort();

console.log(`Найдено ${iconFiles.length} иконок Material Design`);

const iconPaths = {};
let successCount = 0;
let errorCount = 0;

// Функция для извлечения SVG пути из исходного кода файла
function extractSvgPathFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Ищем path элемент с d атрибутом
    const pathMatch = content.match(/jsx\("path",\s*\{\s*d:\s*"([^"]+)"/);
    if (pathMatch) {
      return pathMatch[1];
    }
    
    // Альтернативный паттерн для других форматов
    const altPathMatch = content.match(/d:\s*"([^"]+)"/);
    if (altPathMatch) {
      return altPathMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error(`Ошибка чтения файла ${filePath}:`, error.message);
    return null;
  }
}

// Обрабатываем каждую иконку
iconFiles.forEach(file => {
  try {
    const iconPath = path.join(iconsPath, file);
    const iconName = file.replace('.js', '');
    
    // Извлекаем SVG путь из исходного кода
    const svgPath = extractSvgPathFromFile(iconPath);
    
    if (svgPath) {
      iconPaths[iconName] = svgPath;
      successCount++;
    } else {
      console.log(`Не удалось извлечь путь для ${iconName}`);
      errorCount++;
    }
  } catch (error) {
    console.error(`Ошибка при обработке ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`Успешно извлечено ${successCount} SVG путей`);
console.log(`Ошибок: ${errorCount}`);

// Сохраняем JSON файл в dist
fs.writeFileSync(outputPathJson, JSON.stringify(iconPaths, null, 2));
console.log(`JSON файл создан: ${outputPathJson}`);