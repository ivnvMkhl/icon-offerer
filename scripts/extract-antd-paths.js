import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { ensureDirForFile } from './utils.js';

export async function extractAntdPaths({ iconsPath, outputFile, pretty = false }) {
  const iconsLibPath = path.resolve(iconsPath);
  const outputFilePath = path.resolve(outputFile);

  ensureDirForFile(outputFilePath);

  const iconFiles = fs.readdirSync(iconsLibPath)
    .filter(file => file.endsWith('.js') && (file.includes('Outlined') || file.includes('Filled') || file.includes('TwoTone')))
    .sort();

  const outlinedCount = iconFiles.filter(f => f.includes('Outlined')).length;
  const filledCount = iconFiles.filter(f => f.includes('Filled')).length;
  const twotoneCount = iconFiles.filter(f => f.includes('TwoTone')).length;

  const iconPaths = {};

  for (const file of iconFiles) {
    try {
      const iconPath = path.join(iconsLibPath, file);
      const require = createRequire(import.meta.url);
      const iconModule = require(iconPath);
      const iconData = iconModule.default;
      
      if (iconData && iconData.icon) {
        const iconName = file.replace('.js', '');
        
        let svgPath = '';
        
        if (iconData.icon.children) {
          const pathElements = iconData.icon.children.filter(child => child.tag === 'path');
          if (pathElements.length > 0) {
            svgPath = pathElements.map(path => {
              const attrs = path.attrs || {};
              const pathAttrs = Object.entries(attrs)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
              return `<path ${pathAttrs}/>`;
            }).join('');
          }
        }
        
        if (svgPath) {
          iconPaths[iconName] = svgPath;
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(iconPaths, null, pretty ? 2 : 0));
  
  return {
    total: iconFiles.length,
    extracted: Object.keys(iconPaths).length,
    outlined: outlinedCount,
    filled: filledCount,
    twotone: twotoneCount
  };
}
