import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex").substring(0, 8);
}

function hashJavaScriptFiles() {
  const outputDir = process.env.BUILD_OUTPUT_DIR || 'dist/js';
  const jsDir = path.join(__dirname, "..", outputDir);
  const manifest = {};

  if (!fs.existsSync(jsDir)) {
    console.log("JS directory not found, skipping hashing");
    return manifest;
  }

  const jsFiles = fs.readdirSync(jsDir).filter((file) => {
    return (
      (file.endsWith(".js") || file.endsWith(".json")) &&
      !/\.([a-f0-9]{8})\.(js|json)$/.test(file)
    );
  });

  const cssDir = path.join(__dirname, "../dist/css");
  const cssFiles = fs.existsSync(cssDir)
    ? fs.readdirSync(cssDir).filter((file) => {
        return file.endsWith(".css") && !/\.([a-f0-9]{8})\.css$/.test(file);
      })
    : [];

  console.log(`Found ${jsFiles.length} JS/JSON files for hashing:`);

  jsFiles.forEach((file) => {
    const originalPath = path.join(jsDir, file);
    const hash = createFileHash(originalPath);
    const extension = file.endsWith(".json") ? ".json" : ".js";
    const newFileName = file.replace(extension, `.${hash}${extension}`);
    const newPath = path.join(jsDir, newFileName);

    fs.copyFileSync(originalPath, newPath);
    fs.unlinkSync(originalPath);
    manifest[file] = newFileName;

    console.log(`  ${file} -> ${newFileName} (original removed)`);
  });

  if (cssFiles.length > 0) {
    console.log(`Found ${cssFiles.length} CSS files for hashing:`);

    cssFiles.forEach((file) => {
      const originalPath = path.join(cssDir, file);
      const hash = createFileHash(originalPath);
      const newFileName = file.replace(".css", `.${hash}.css`);
      const newPath = path.join(cssDir, newFileName);

      fs.copyFileSync(originalPath, newPath);
      fs.unlinkSync(originalPath);
      manifest[file] = newFileName;

      console.log(`  ${file} -> ${newFileName} (original removed)`);
    });
  }

  const manifestPath = path.join(__dirname, "..", outputDir, "js-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest saved: ${manifestPath}`);

  return manifest;
}

/**
 * Обновляет HTML файлы с хешированными именами JS файлов
 */
function updateHtmlFiles(manifest) {
  const distDir = path.join(__dirname, "../dist");

  function findHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...findHtmlFiles(fullPath));
      } else if (item.endsWith(".html")) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const htmlFiles = findHtmlFiles(distDir);
  console.log(`Updating ${htmlFiles.length} HTML files:`);

  htmlFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, "utf8");
    let updated = false;

    Object.entries(manifest).forEach(([original, hashed]) => {
      const srcRegex = new RegExp(`src="[^"]*${original}"`, "g");
      const newSrcContent = content.replace(
        srcRegex,
        `src="/icon-offerer/js/${hashed}"`,
      );
      if (newSrcContent !== content) {
        content = newSrcContent;
        updated = true;
      }

      const jsFileRegex = new RegExp(`jsFile: 'js/${original}'`, "g");
      const newJsFileContent = content.replace(
        jsFileRegex,
        `jsFile: 'js/${hashed}'`,
      );
      if (newJsFileContent !== content) {
        content = newJsFileContent;
        updated = true;
      }

      if (original.endsWith(".json")) {
        const dataFileRegex = new RegExp(`dataFile: '${original}'`, "g");
        const newDataFileContent = content.replace(
          dataFileRegex,
          `dataFile: '${hashed}'`,
        );
        if (newDataFileContent !== content) {
          content = newDataFileContent;
          updated = true;
        }
      }

      if (original.endsWith(".css")) {
        const cssRegex = new RegExp(`href="[^"]*${original}"`, "g");
        const newCssContent = content.replace(
          cssRegex,
          `href="/icon-offerer/css/${hashed}"`,
        );
        if (newCssContent !== content) {
          content = newCssContent;
          updated = true;
        }
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content);
      const relativePath = path.relative(distDir, filePath);
      console.log(`  Updated: ${relativePath}`);
    }
  });
}

/**
 * Удаляет оригинальные JS файлы без хешей
 */
function cleanupOriginalFiles() {
  const outputDir = process.env.BUILD_OUTPUT_DIR || 'dist/js';
  const jsDir = path.join(__dirname, "..", outputDir);

  if (!fs.existsSync(jsDir)) {
    console.log("JS directory not found, skipping cleanup");
    return;
  }

  const allFiles = fs.readdirSync(jsDir);
  const jsFiles = allFiles.filter(
    (file) => file.endsWith(".js") || file.endsWith(".json"),
  );

  const cssDir = path.join(__dirname, "../dist/css");
  if (fs.existsSync(cssDir)) {
    const allCssFiles = fs.readdirSync(cssDir);
    const cssFiles = allCssFiles.filter((file) => file.endsWith(".css"));

    cssFiles.forEach((file) => {
      const hasHash = /\.([a-f0-9]{8})\.css$/.test(file);

      if (!hasHash) {
        const filePath = path.join(cssDir, file);
        fs.unlinkSync(filePath);
        console.log(`  Removed: ${file}`);
      }
    });
  }

  console.log("Cleaning up original files without hashes:");

  jsFiles.forEach((file) => {
    const hasHash = /\.([a-f0-9]{8})\.(js|json)$/.test(file);

    if (!hasHash) {
      const filePath = path.join(jsDir, file);
      fs.unlinkSync(filePath);
      console.log(`  Removed: ${file}`);
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

  const htaccessPath = path.join(__dirname, "../dist/.htaccess");
  fs.writeFileSync(htaccessPath, htaccessContent);
  console.log("Created .htaccess file for caching");
}


export { hashJavaScriptFiles, updateHtmlFiles, createHtaccess, cleanupOriginalFiles };
