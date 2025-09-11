import { extractAntdPaths } from './extract-antd-paths.js';
import { extractMuiIcons } from './extract-mui-icons.js';
import { extractUnicodeIcons } from './extract-unicode-icons.js';

const EXTRACTORS_CONFIG = [
  {
    name: 'Ant Design',
    extractor: extractAntdPaths,
    config: {
      iconsPath: 'node_modules/@ant-design/icons-svg/lib/asn/',
      outputFile: 'antd-icon-paths.json'
    }
  },
  {
    name: 'Material Design',
    extractor: extractMuiIcons,
    config: {
      iconsPath: 'node_modules/@mui/icons-material',
      outputFile: 'mui-icon-paths.json'
    }
  },
  {
    name: 'Unicode',
    extractor: extractUnicodeIcons,
    config: {
      outputFile: 'unicode-icon-paths.json'
    }
  }
];

const extractor = async (accPromise, { name, extractor: extractorFn, config }, outputDir) => {
  const acc = await accPromise;
  const result = await extractorFn({
    ...config,
    outputFile: `${outputDir}/${config.outputFile}`
  });
  
  console.log(`Extracted ${name}: ${result.extracted}/${result.total} (errors: ${result.errors})`);
  
  return [...acc, { name, result }];
};

async function extractIcons() {
  console.log('Starting extraction of all icons...');
  
  const outputDir = process.env.BUILD_OUTPUT_DIR || 'dist/js';
  
  try {
    await EXTRACTORS_CONFIG.reduce(
      (accPromise, config) => extractor(accPromise, config, outputDir),
      Promise.resolve([])
    );
    
    console.log('All icons successfully extracted\n');
    
  } catch (error) {
    console.error('Error extracting icons:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  extractIcons();
}

export { extractIcons };
