import fs from 'fs';
import path from 'path';
import { ensureDirForFile } from './utils.js';

export async function extractUnicodeIcons({ outputFile, pretty = false }) {
  // Нормализуем путь
  const outputFilePath = path.resolve(outputFile);

  // Создаем директорию если не существует
  ensureDirForFile(outputFilePath);

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


unicodeRanges.forEach(range => {
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
                    code: codePoint
                  };
        
        validCount++;
      }
    } catch (error) {
      // Пропускаем недопустимые кодовые точки
    }
    
    count++;
    
  }
  
  });

  // Сохраняем в JSON файл
  fs.writeFileSync(outputFilePath, JSON.stringify(unicodeIcons, null, pretty ? 2 : 0));

  // Создаем статистику по диапазонам
  const rangeStats = {};
  Object.values(unicodeIcons).forEach(icon => {
    if (!rangeStats[icon.range]) {
      rangeStats[icon.range] = 0;
    }
    rangeStats[icon.range]++;
  });

  return {
    total: Object.keys(unicodeIcons).length,
    ranges: rangeStats
  };
}

