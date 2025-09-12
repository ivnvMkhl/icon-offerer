import fs from "fs";
import path from "path";
import crypto from "crypto";

function createFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex").substring(0, 8);
}

function findFilesByExtension(dirPath, extensions, ignoredFiles = []) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = [];
  const extensionPattern = extensions.map(ext => ext.replace('.', '\\.')).join('|');
  const hashPattern = `\\.([a-f0-9]{8})\\.(${extensionPattern})$`;

  function searchRecursively(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchRecursively(fullPath);
      } else if (stat.isFile()) {
        const hasValidExtension = extensions.some(ext => item.endsWith(ext));
        const hasNoHash = !new RegExp(hashPattern).test(item);
        
        if (hasValidExtension && hasNoHash) {
          const relativePath = path.relative(dirPath, fullPath);
          const isIgnored = ignoredFiles.some(ignoredFile => 
            relativePath === ignoredFile || relativePath.endsWith(ignoredFile)
          );
          
          if (!isIgnored) {
            files.push(relativePath);
          }
        }
      }
    }
  }

  searchRecursively(dirPath);
  return files;
}

function hashFiles(outputDir, files, extensions) {
  return files.reduce((fileMappings, file) => {
    const originalPath = path.join(outputDir, file);
    const hash = createFileHash(originalPath);
    
    const extension = extensions.find(ext => file.endsWith(ext));
    const newFileName = file.replace(extension, `.${hash}${extension}`);
    const newPath = path.join(outputDir, newFileName);

    fs.renameSync(originalPath, newPath);

    return {
      ...fileMappings,
      [file]: newFileName
    };
  }, {});
}

function hashAssets({ outputDir, extensions, ignoredFiles = [] }) {
  if (!outputDir) {
    throw new Error('outputDir parameter is required for hashAssets');
  }
  
  if (!extensions || !Array.isArray(extensions) || extensions.length === 0) {
    return {};
  }

  const files = findFilesByExtension(outputDir, extensions, ignoredFiles);
  const hashManifest = hashFiles(outputDir, files, extensions);
  const totalFiles = Object.keys(hashManifest).length;
  console.log(`Found ${totalFiles} files for hashing:`);
  
  Object.entries(hashManifest).forEach(([original, hashed]) => {
    console.log(`  ${original} -> ${hashed} (original removed)`);
  });

  return hashManifest;
}

function updateHashedLinks({ hashManifest, outputDir, extensions = ['.html'], files = [] }) {
  if (!outputDir) {
    throw new Error('outputDir parameter is required for updateHashedLinks');
  }

  if (!hashManifest || Object.keys(hashManifest).length === 0) {
    console.log('No files to update (empty manifest)');
    return;
  }

  const filesByExtensions = findFilesByExtension(outputDir, extensions);
  const allFiles = [...filesByExtensions, ...files];
  
  console.log(`Updating ${allFiles.length} files:`);

  allFiles.forEach((relativePath) => {
    const filePath = path.join(outputDir, relativePath);
    const content = fs.readFileSync(filePath, "utf8");
    
    const updatedContent = Object.entries(hashManifest).reduce(
      (acc, [original, hashed]) => acc.replaceAll(original, hashed),
      content
    );

    fs.writeFileSync(filePath, updatedContent);
    console.log(`  Updated: ${relativePath}`);
  });
}


export { hashAssets, updateHashedLinks };
