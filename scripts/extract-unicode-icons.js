import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPathJson = path.resolve('dist/js/unicode-icon-paths.json');

// Создаем директорию если не существует
const distJsDir = path.dirname(outputPathJson);
if (!fs.existsSync(distJsDir)) {
  fs.mkdirSync(distJsDir, { recursive: true });
}

// Определяем диапазоны Unicode символов для иконок
const unicodeRanges = [
  {
    name: 'Miscellaneous Symbols',
    start: 0x2600,
    end: 0x26FF,
    description: 'Различные символы (☀, ☁, ☎, ⚡, ⭐, etc.)'
  },
  {
    name: 'Dingbats',
    start: 0x2700,
    end: 0x27BF,
    description: 'Символы-украшения (✂, ✈, ✉, ✏, ✨, etc.)'
  },
  {
    name: 'Miscellaneous Symbols and Pictographs',
    start: 0x1F300,
    end: 0x1F5FF,
    description: 'Различные символы и пиктограммы (🌍, 🎨, 🔧, etc.)'
  },
  {
    name: 'Emoticons',
    start: 0x1F600,
    end: 0x1F64F,
    description: 'Эмотиконы (😀, 😁, 😂, etc.)'
  },
  {
    name: 'Transport and Map Symbols',
    start: 0x1F680,
    end: 0x1F6FF,
    description: 'Транспорт и карты (🚀, 🚗, 🚲, etc.)'
  },
  {
    name: 'Geometric Shapes',
    start: 0x25A0,
    end: 0x25FF,
    description: 'Геометрические фигуры (■, ▲, ●, etc.)'
  },
  {
    name: 'Arrows',
    start: 0x2190,
    end: 0x21FF,
    description: 'Стрелки (←, ↑, →, ↓, etc.)'
  },
  {
    name: 'Mathematical Operators',
    start: 0x2200,
    end: 0x22FF,
    description: 'Математические операторы (∑, ∏, ∫, etc.)'
  }
];

const unicodeIcons = {};

console.log('Начинаем извлечение Unicode символов...');

unicodeRanges.forEach(range => {
  console.log(`\nОбрабатываем диапазон: ${range.name} (U+${range.start.toString(16).toUpperCase()} - U+${range.end.toString(16).toUpperCase()})`);
  
  let count = 0;
  let validCount = 0;
  
  for (let codePoint = range.start; codePoint <= range.end; codePoint++) {
    try {
      const char = String.fromCodePoint(codePoint);
      
      // Проверяем, что символ не является пробелом или невидимым
      if (char.trim() && char !== '\uFEFF' && char !== '\u200B') {
        const unicodeName = `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
        
        unicodeIcons[unicodeName] = {
          char: char,
          code: codePoint,
          range: range.name,
          description: range.description
        };
        
        validCount++;
      }
    } catch (error) {
      // Пропускаем недопустимые кодовые точки
    }
    
    count++;
    
    // Показываем прогресс каждые 100 символов
    if (count % 100 === 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(`\nНайдено ${validCount} валидных символов из ${count} проверенных`);
});

console.log(`\n\nВсего извлечено ${Object.keys(unicodeIcons).length} Unicode символов`);

// Сохраняем в JSON файл
fs.writeFileSync(outputPathJson, JSON.stringify(unicodeIcons, null, 2));
console.log(`JSON файл создан: ${outputPathJson}`);

// Создаем статистику по диапазонам
const rangeStats = {};
Object.values(unicodeIcons).forEach(icon => {
  if (!rangeStats[icon.range]) {
    rangeStats[icon.range] = 0;
  }
  rangeStats[icon.range]++;
});

console.log('\nСтатистика по диапазонам:');
Object.entries(rangeStats).forEach(([range, count]) => {
  console.log(`  ${range}: ${count} символов`);
});
