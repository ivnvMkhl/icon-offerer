import fs from 'fs';
import path from 'path';
import { ensureDirForFile } from './utils.js';

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

export async function extractUnicodeIcons({ outputFile, pretty = false }) {
  const outputFilePath = path.resolve(outputFile);

  ensureDirForFile(outputFilePath);

  const unicodeIcons = unicodeRanges.reduce((acc, range) => {
    const codePoints = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i);
    
    codePoints.forEach(codePoint => {
      const char = String.fromCodePoint(codePoint);
      
      if (char.trim() && char !== '\uFEFF' && char !== '\u200B') {
        const unicodeName = `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
        
        acc[unicodeName] = {
          char: char,
          code: codePoint
        };
      }
    });
    
    return acc;
  }, {});

  fs.writeFileSync(outputFilePath, JSON.stringify(unicodeIcons, null, pretty ? 2 : 0));

  return {
    total: Object.keys(unicodeIcons).length,
    extracted: Object.keys(unicodeIcons).length,
    errors: 0
  };
}

