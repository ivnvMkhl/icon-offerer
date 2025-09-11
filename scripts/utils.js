import fs from 'fs';
import path from 'path';

/**
 * Создает директорию для файла, если она не существует
 * @param {string} filePath - путь к файлу
 */
export function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
