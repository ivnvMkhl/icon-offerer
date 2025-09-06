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
    
    const jsFiles = fs.readdirSync(jsDir).filter(file => {
        // Исключаем файлы, которые уже содержат хеш (8 символов после точки)
        return file.endsWith('.js') && !/\.([a-f0-9]{8})\.js$/.test(file);
    });
    
    console.log(`Найдено ${jsFiles.length} JS файлов для хеширования:`);
    
    jsFiles.forEach(file => {
        const originalPath = path.join(jsDir, file);
        const hash = createFileHash(originalPath);
        const newFileName = file.replace('.js', `.${hash}.js`);
        const newPath = path.join(jsDir, newFileName);
        
        // Копируем файл с новым именем
        fs.copyFileSync(originalPath, newPath);
        
        // Удаляем оригинальный файл
        fs.unlinkSync(originalPath);
        
        // Сохраняем маппинг
        manifest[file] = newFileName;
        
        console.log(`  ${file} -> ${newFileName} (удален оригинал)`);
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
    
    // Рекурсивно находим все HTML файлы
    function findHtmlFiles(dir) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...findHtmlFiles(fullPath));
            } else if (item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    const htmlFiles = findHtmlFiles(distDir);
    console.log(`Обновляем ${htmlFiles.length} HTML файлов:`);
    
    htmlFiles.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Заменяем ссылки на JS файлы
        Object.entries(manifest).forEach(([original, hashed]) => {
            const regex = new RegExp(`src="[^"]*${original}"`, 'g');
            const newContent = content.replace(regex, `src="/icon-refferer/js/${hashed}"`);
            if (newContent !== content) {
                content = newContent;
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(filePath, content);
            const relativePath = path.relative(distDir, filePath);
            console.log(`  Обновлен: ${relativePath}`);
        }
    });
}

/**
 * Удаляет оригинальные JS файлы без хешей
 */
function cleanupOriginalFiles() {
    const jsDir = path.join(__dirname, '../dist/js');
    
    if (!fs.existsSync(jsDir)) {
        console.log('JS директория не найдена, пропускаем очистку');
        return;
    }
    
    const allFiles = fs.readdirSync(jsDir);
    const jsFiles = allFiles.filter(file => file.endsWith('.js'));
    
    console.log('Очищаем оригинальные файлы без хешей:');
    
    jsFiles.forEach(file => {
        // Проверяем, что файл не содержит хеш (8 символов после точки)
        const hasHash = /\.([a-f0-9]{8})\.js$/.test(file);
        
        if (!hasHash) {
            const filePath = path.join(jsDir, file);
            fs.unlinkSync(filePath);
            console.log(`  Удален: ${file}`);
        }
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
            cleanupOriginalFiles();
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
