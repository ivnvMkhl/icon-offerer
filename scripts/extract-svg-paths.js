const fs = require('fs');
const path = require('path');

// Путь к иконкам Ant Design
const iconsPath = path.resolve('node_modules/@ant-design/icons-svg/lib/asn/');
const outputPathJson = path.resolve('dist/js/antd-icon-paths.json');

// Создаем директорию dist/js если её нет
const distJsDir = path.dirname(outputPathJson);
if (!fs.existsSync(distJsDir)) {
  fs.mkdirSync(distJsDir, { recursive: true });
}

// Получаем список всех файлов иконок
const iconFiles = fs.readdirSync(iconsPath)
  .filter(file => file.endsWith('.js') && file.includes('Outlined'))
  .sort();

console.log(`Найдено ${iconFiles.length} иконок Outlined`);

const iconPaths = {};

// Обрабатываем каждую иконку
iconFiles.forEach(file => {
  try {
    const iconPath = path.join(iconsPath, file);
    const iconModule = require(iconPath);
    const iconData = iconModule.default;
    
    if (iconData && iconData.icon && iconData.icon.children) {
      const iconName = file.replace('.js', '');
      
      // Извлекаем SVG путь
      const svgPath = iconData.icon.children
        .filter(child => child.tag === 'path')
        .map(child => child.attrs.d)
        .join(' ');
      
      if (svgPath) {
        iconPaths[iconName] = svgPath;
      }
    }
  } catch (error) {
    console.error(`Ошибка при обработке ${file}:`, error.message);
  }
});

console.log(`Успешно извлечено ${Object.keys(iconPaths).length} SVG путей`);

// Сохраняем JSON файл в dist
fs.writeFileSync(outputPathJson, JSON.stringify(iconPaths, null, 2));
console.log(`JSON файл создан: ${outputPathJson}`);