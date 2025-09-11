import fs from 'fs';
import path from 'path';
import { ensureDirForFile } from './utils.js';

export async function extractMuiIcons({ iconsPath, outputFile, pretty = false }) {
  const iconsLibPath = path.resolve(iconsPath);
  const outputFilePath = path.resolve(outputFile);

  ensureDirForFile(outputFilePath);

  const iconFiles = fs.readdirSync(iconsLibPath)
    .filter(file => file.endsWith('.js') && !file.includes('.d.ts') && file !== 'index.js')
    .sort();

  const iconPaths = {};
  let successCount = 0;
  let errorCount = 0;

  function extractSvgPathsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const pathMatches = content.match(/jsx\("path",\s*\{[^}]*d:\s*"([^"]+)"[^}]*\}/g);
    if (pathMatches && pathMatches.length > 0) {
      const paths = pathMatches.map(match => {
        const dMatch = match.match(/d:\s*"([^"]+)"/);
        return dMatch ? dMatch[1] : null;
      }).filter(Boolean);
      
      if (paths.length > 0) {
        return paths.map(d => `<path d="${d}"/>`).join('');
      }
    }
    
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
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
  }

  iconFiles.forEach(file => {
  try {
    const iconPath = path.join(iconsLibPath, file);
    const iconName = file.replace('.js', '');
    
    const svgPath = extractSvgPathsFromFile(iconPath);
    
    if (svgPath) {
      iconPaths[iconName] = svgPath;
      successCount++;
    } else {
      errorCount++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
    errorCount++;
  }
  });

  fs.writeFileSync(outputFilePath, JSON.stringify(iconPaths, null, pretty ? 2 : 0));
  
  return {
    total: iconFiles.length,
    extracted: successCount,
    errors: errorCount
  };
}
