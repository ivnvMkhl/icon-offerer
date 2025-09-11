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
    },
    formatter: (result) => {
      const errors = result.total - result.extracted;
      return `Ant Design: ${result.extracted}/${result.total} icons (Outlined: ${result.outlined}, Filled: ${result.filled}, TwoTone: ${result.twotone}, errors: ${errors})`;
    }
  },
  {
    name: 'Material Design',
    extractor: extractMuiIcons,
    config: {
      iconsPath: 'node_modules/@mui/icons-material',
      outputFile: 'mui-icon-paths.json'
    },
    formatter: (result) => `Material Design: ${result.extracted}/${result.total} icons (errors: ${result.errors})`
  },
  {
    name: 'Unicode',
    extractor: extractUnicodeIcons,
    config: {
      outputFile: 'unicode-icon-paths.json'
    },
    formatter: (result) => `Unicode: ${result.total} symbols`
  }
];

const extractor = async (accPromise, { name, extractor: extractorFn, config, formatter }, outputDir) => {
  const acc = await accPromise;
  
  console.log(`Extracting ${name} icons...`);
  
  const result = await extractorFn({
    ...config,
    outputFile: `${outputDir}/${config.outputFile}`
  });
  
  console.log(`${formatter(result)}\n`);
  
  return [...acc, { name, result }];
};

async function extractIcons() {
  console.log('Starting extraction of all icons...\n');
  
  const outputDir = process.env.BUILD_OUTPUT_DIR || 'dist/js';
  
  try {
    await EXTRACTORS_CONFIG.reduce(
      (accPromise, config) => extractor(accPromise, config, outputDir),
      Promise.resolve([])
    );
    
    console.log('All icons successfully extracted!');
    
  } catch (error) {
    console.error('Error extracting icons:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  extractIcons();
}

export { extractIcons };
