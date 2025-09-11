import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { ensureDirForFile } from './utils.js';

export async function extractAntdPaths({ iconsPath, outputFile, pretty = false }) {
  // Нормализуем пути
  const iconsLibPath = path.resolve(iconsPath);
  const outputFilePath = path.resolve(outputFile);

  // Создаем директорию если её нет
  ensureDirForFile(outputFilePath);

  // Получаем список всех файлов иконок (Outlined, Filled, TwoTone)
  const iconFiles = fs.readdirSync(iconsLibPath)
    .filter(file => file.endsWith('.js') && (file.includes('Outlined') || file.includes('Filled') || file.includes('TwoTone')))
    .sort();

  const outlinedCount = iconFiles.filter(f => f.includes('Outlined')).length;
  const filledCount = iconFiles.filter(f => f.includes('Filled')).length;
  const twotoneCount = iconFiles.filter(f => f.includes('TwoTone')).length;

  const iconPaths = {};

  // Обрабатываем каждую иконку
  for (const file of iconFiles) {
    try {
      const iconPath = path.join(iconsLibPath, file);
      // Используем createRequire для загрузки CommonJS модулей
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

  // Сохраняем JSON файл
  fs.writeFileSync(outputFilePath, JSON.stringify(iconPaths, null, pretty ? 2 : 0));
  
  return {
    total: iconFiles.length,
    extracted: Object.keys(iconPaths).length,
    outlined: outlinedCount,
    filled: filledCount,
    twotone: twotoneCount
  };
}
