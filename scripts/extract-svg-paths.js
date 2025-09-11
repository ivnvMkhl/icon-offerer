import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractSvgPaths() {
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
  for (const file of iconFiles) {
    try {
      const iconPath = path.join(iconsPath, file);
      // Используем createRequire для загрузки CommonJS модулей
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const iconModule = require(iconPath);
      const iconData = iconModule.default;
      
      if (iconData && iconData.icon) {
        const iconName = file.replace('.js', '');
        
        // Извлекаем SVG путь
        let svgPath = '';
        
        if (iconData.icon.children) {
          // Обрабатываем все типы иконок (Outlined, Filled, TwoTone)
          const pathElements = iconData.icon.children.filter(child => child.tag === 'path');
          if (pathElements.length > 0) {
            // Объединяем все path элементы в один SVG
            svgPath = pathElements.map(path => {
              // Обрабатываем атрибуты path элемента
              const attrs = path.attrs || {};
              const pathAttrs = Object.entries(attrs)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
              return `<path ${pathAttrs}/>`;
            }).join('');
          }
        }
        
        if (svgPath) {
          iconPaths[iconName] = svgPath;
        }
      }
    } catch (error) {
      console.error(`Ошибка при обработке ${file}:`, error.message);
    }
  }

  console.log(`Успешно извлечено ${Object.keys(iconPaths).length} SVG путей`);

  // Сохраняем JSON файл в dist
  fs.writeFileSync(outputPathJson, JSON.stringify(iconPaths, null, 2));
  console.log(`JSON файл создан: ${outputPathJson}`);
}

// Запускаем функцию
extractSvgPaths().catch(console.error);