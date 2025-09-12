import dotenv from 'dotenv';
import { hashAssets, updateHashedLinks } from './scripts/hash-assets.js';

dotenv.config();

export default function(eleventyConfig) {
  // Копируем статические файлы
  eleventyConfig.addPassthroughCopy("src/css/**/*");
  eleventyConfig.addPassthroughCopy("src/js/**/*");
  eleventyConfig.addPassthroughCopy("src/images/**/*");
  eleventyConfig.addPassthroughCopy("src/fonts/**/*");
  eleventyConfig.addPassthroughCopy({
    "src/static/favicon.ico": "favicon.ico",
    "src/static/apple-touch-icon.svg": "apple-touch-icon.svg", 
    "src/static/icon-192.png": "icon-192.png",
    "src/static/icon-512.png": "icon-512.png",
    "src/static/screenshot-*.png": "./",
    "src/static/.htaccess": ".htaccess"
  });

  eleventyConfig.addGlobalData("baseUrl", process.env.ELEVENTY_ENV === 'development' ? '' : process.env.BASE_URL);  
  eleventyConfig.addGlobalData("aiSearchUrl", process.env.AI_SEARCH_URL);
  eleventyConfig.addGlobalData("smartCaptchaSitekey", process.env.SMART_CAPTCHA_SITEKEY);
  eleventyConfig.addGlobalData("isDev", process.env.ELEVENTY_ENV === 'development');
  eleventyConfig.addGlobalData("isProduction", process.env.ELEVENTY_ENV === 'production');

  // Хеширование файлов после сборки (только в production)
  eleventyConfig.on('afterBuild', async ({ runMode, outputMode, dir }) => {
    if (process.env.ELEVENTY_ENV === 'production') {
      console.log('🚀 Starting file hashing after build...');
      
      try {
        // Передаем информацию о директории сборки
        const hashManifest = hashAssets({
          outputDir: dir.output,
          extensions: ['.js', '.json', '.css'],
          ignoredFiles: ['site.webmanifest.json']
        });
        
        updateHashedLinks({
          hashManifest: hashManifest,
          outputDir: dir.output,
          extensions: ['.html'],
          files: ['.htaccess']
        });
        console.log('✅ File hashing completed successfully!');
      } catch (error) {
        console.error('❌ Error during hashing:', error.message);
      }
    }
  });

  // Настройки для входной и выходной директорий
  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "includes",
      layouts: "layouts"
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
