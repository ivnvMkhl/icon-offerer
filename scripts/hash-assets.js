const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Создает хеш для файла на основе его содержимого
 */
function createFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * Обрабатывает JavaScript файлы и создает хешированные версии
 */
function hashJavaScriptFiles() {
    const jsDir = path.join(__dirname, '../dist/js');
    const manifest = {};
    
    if (!fs.existsSync(jsDir)) {
        console.log('JS директория не найдена, пропускаем хеширование');
        return manifest;
    }
    
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    
    console.log(`Найдено ${jsFiles.length} JS файлов для хеширования:`);
    
    jsFiles.forEach(file => {
        const originalPath = path.join(jsDir, file);
        const hash = createFileHash(originalPath);
        const newFileName = file.replace('.js', `.${hash}.js`);
        const newPath = path.join(jsDir, newFileName);
        
        // Копируем файл с новым именем
        fs.copyFileSync(originalPath, newPath);
        
        // Сохраняем маппинг
        manifest[file] = newFileName;
        
        console.log(`  ${file} -> ${newFileName}`);
    });
    
    // Сохраняем манифест
    const manifestPath = path.join(__dirname, '../dist/js-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`Манифест сохранен: ${manifestPath}`);
    
    return manifest;
}

/**
 * Обновляет HTML файлы с хешированными именами JS файлов
 */
function updateHtmlFiles(manifest) {
    const distDir = path.join(__dirname, '../dist');
    const htmlFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.html'));
    
    console.log(`Обновляем ${htmlFiles.length} HTML файлов:`);
    
    htmlFiles.forEach(file => {
        const filePath = path.join(distDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Заменяем ссылки на JS файлы
        Object.entries(manifest).forEach(([original, hashed]) => {
            const regex = new RegExp(`src="[^"]*${original}"`, 'g');
            content = content.replace(regex, `src="/icon-refferer/js/${hashed}"`);
        });
        
        fs.writeFileSync(filePath, content);
        console.log(`  Обновлен: ${file}`);
    });
}

/**
 * Создает .htaccess файл для кеширования
 */
function createHtaccess() {
    const htaccessContent = `# Кеширование для JavaScript файлов с хешами
<FilesMatch "\\.(js)$">
    # Для файлов с хешами (содержат 8 символов после точки)
    <If "%{REQUEST_URI} =~ m/\\.[a-f0-9]{8}\\.js$/">
        Header set Cache-Control "public, max-age=31536000, immutable"
        Header set Expires "Thu, 31 Dec 2037 23:55:55 GMT"
    </If>
    # Для обычных JS файлов (без хешей)
    <Else>
        Header set Cache-Control "public, max-age=86400"
        Header set Expires "Thu, 31 Dec 2037 23:55:55 GMT"
    </Else>
</FilesMatch>

# Кеширование для CSS файлов
<FilesMatch "\\.(css)$">
    Header set Cache-Control "public, max-age=86400"
    Header set Expires "Thu, 31 Dec 2037 23:55:55 GMT"
</FilesMatch>

# Кеширование для изображений
<FilesMatch "\\.(ico|png|jpg|jpeg|gif|svg|webp)$">
    Header set Cache-Control "public, max-age=31536000"
    Header set Expires "Thu, 31 Dec 2037 23:55:55 GMT"
</FilesMatch>

# Кеширование для шрифтов
<FilesMatch "\\.(woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000"
    Header set Expires "Thu, 31 Dec 2037 23:55:55 GMT"
</FilesMatch>
`;
    
    const htaccessPath = path.join(__dirname, '../dist/.htaccess');
    fs.writeFileSync(htaccessPath, htaccessContent);
    console.log('Создан .htaccess файл для кеширования');
}

// Основная функция
function main() {
    console.log('🚀 Начинаем хеширование JavaScript файлов...');
    
    try {
        const manifest = hashJavaScriptFiles();
        
        if (Object.keys(manifest).length > 0) {
            updateHtmlFiles(manifest);
            createHtaccess();
            console.log('✅ Хеширование завершено успешно!');
        } else {
            console.log('⚠️  JS файлы не найдены для хеширования');
        }
    } catch (error) {
        console.error('❌ Ошибка при хешировании:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { hashJavaScriptFiles, updateHtmlFiles, createHtaccess };
