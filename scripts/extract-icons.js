import { extractAntdPaths } from './extract-antd-paths.js';
import { extractMuiIcons } from './extract-mui-icons.js';
import { extractUnicodeIcons } from './extract-unicode-icons.js';

/**
 * Извлекает все иконки последовательно
 * Используется последовательное выполнение для лучшего контроля ошибок
 * и более читаемого вывода в консоли
 */
async function extractAllIcons() {
  console.log('🚀 Начинаем извлечение всех иконок...\n');
  
  const startTime = Date.now();
  
  try {
    // Извлекаем Ant Design иконки
    console.log('1️⃣ Извлечение Ant Design иконок...');
    const antdResult = await extractAntdPaths();
    const antdErrors = antdResult.total - antdResult.extracted;
    console.log(`✅ Ant Design: ${antdResult.extracted}/${antdResult.total} иконок (Outlined: ${antdResult.outlined}, Filled: ${antdResult.filled}, TwoTone: ${antdResult.twotone}, ошибок: ${antdErrors})\n`);
    
    // Извлекаем Material Design иконки
    console.log('2️⃣ Извлечение Material Design иконок...');
    const muiResult = await extractMuiIcons();
    console.log(`✅ Material Design: ${muiResult.extracted}/${muiResult.total} иконок (ошибок: ${muiResult.errors})\n`);
    
    // Извлекаем Unicode символы
    console.log('3️⃣ Извлечение Unicode символов...');
    const unicodeResult = await extractUnicodeIcons();
    console.log(`✅ Unicode: ${unicodeResult.total} символов\n`);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`🎉 Все иконки успешно извлечены за ${duration} секунд!`);
    console.log(`📊 Итого: ${antdResult.extracted + muiResult.extracted + unicodeResult.total} иконок и символов`);
    
  } catch (error) {
    console.error('❌ Ошибка при извлечении иконок:', error.message);
    process.exit(1);
  }
}

// Запускаем функцию только если файл выполняется напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  extractAllIcons();
}

export { extractAllIcons };
