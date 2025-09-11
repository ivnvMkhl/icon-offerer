import fs from 'fs';
import path from 'path';

export async function extractMuiIcons() {
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


  const iconPaths = {};
  let successCount = 0;
  let errorCount = 0;

  // Функция для извлечения всех SVG path элементов из исходного кода файла
  function extractSvgPathsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Ищем все path элементы с d атрибутом
    const pathMatches = content.match(/jsx\("path",\s*\{[^}]*d:\s*"([^"]+)"[^}]*\}/g);
    if (pathMatches && pathMatches.length > 0) {
      // Извлекаем все path элементы
      const paths = pathMatches.map(match => {
        const dMatch = match.match(/d:\s*"([^"]+)"/);
        return dMatch ? dMatch[1] : null;
      }).filter(Boolean);
      
      if (paths.length > 0) {
        // Объединяем все path элементы в один SVG
        return paths.map(d => `<path d="${d}"/>`).join('');
      }
    }
    
    // Альтернативный паттерн для других форматов - ищем все d атрибуты
    const allPathMatches = content.match(/d:\s*"([^"]+)"/g);
    if (allPathMatches && allPathMatches.length > 0) {
      const paths = allPathMatches.map(match => {
        const dMatch = match.match(/d:\s*"([^"]+)"/);
        return dMatch ? dMatch[1] : null;
      }).filter(Boolean);
      
      if (paths.length > 0) {
        return paths.map(d => `<path d="${d}"/>`).join('');
      }
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
    
    // Извлекаем все SVG path элементы из исходного кода
    const svgPath = extractSvgPathsFromFile(iconPath);
    
    if (svgPath) {
      iconPaths[iconName] = svgPath;
      successCount++;
    } else {
      errorCount++;
    }
  } catch (error) {
    console.error(`Ошибка при обработке ${file}:`, error.message);
    errorCount++;
  }
  });

  // Сохраняем JSON файл в dist
  fs.writeFileSync(outputPathJson, JSON.stringify(iconPaths, null, 2));
  
  return {
    total: iconFiles.length,
    extracted: successCount,
    errors: errorCount
  };
}
