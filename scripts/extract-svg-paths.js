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

// Получаем список всех файлов иконок (Outlined, Filled, TwoTone)
const iconFiles = fs.readdirSync(iconsPath)
  .filter(file => file.endsWith('.js') && (file.includes('Outlined') || file.includes('Filled') || file.includes('TwoTone')))
  .sort();

const outlinedCount = iconFiles.filter(f => f.includes('Outlined')).length;
const filledCount = iconFiles.filter(f => f.includes('Filled')).length;
const twotoneCount = iconFiles.filter(f => f.includes('TwoTone')).length;

console.log(`Найдено иконок:`);
console.log(`- Outlined: ${outlinedCount}`);
console.log(`- Filled: ${filledCount}`);
console.log(`- TwoTone: ${twotoneCount}`);
console.log(`- Всего: ${iconFiles.length}`);

const iconPaths = {};

// Обрабатываем каждую иконку
iconFiles.forEach(file => {
  try {
    const iconPath = path.join(iconsPath, file);
    const iconModule = require(iconPath);
    const iconData = iconModule.default;
    
    if (iconData && iconData.icon) {
      const iconName = file.replace('.js', '');
      
      // Извлекаем SVG путь
      let svgPath = '';
      
      // Для TwoTone иконок используем специальную логику
      if (iconName.includes('TwoTone')) {
        // TwoTone иконки имеют другую структуру - они используют CSS переменные
        // Пока что пропускаем их, так как они требуют специальной обработки
        console.log(`Пропускаем TwoTone иконку: ${iconName}`);
        return;
      } else if (iconData.icon.children) {
        // Для Outlined и Filled иконок берем первый path
        const pathElement = iconData.icon.children.find(child => child.tag === 'path');
        if (pathElement) {
          svgPath = pathElement.attrs.d;
        }
      }
      
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