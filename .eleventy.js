module.exports = function(eleventyConfig) {
  // Копируем статические файлы
  eleventyConfig.addPassthroughCopy("src/css/**/*");
  eleventyConfig.addPassthroughCopy("src/js/**/*");
  eleventyConfig.addPassthroughCopy("src/images/**/*");
  eleventyConfig.addPassthroughCopy("src/fonts/**/*");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.svg");

  // Добавляем глобальные данные
  eleventyConfig.addGlobalData("isDev", process.env.ELEVENTY_ENV === 'development');
  eleventyConfig.addGlobalData("isProduction", process.env.ELEVENTY_ENV === 'production');
  
  // Определяем базовый URL
  const baseUrl = process.env.ELEVENTY_ENV === 'development' ? '' : '/icon-refferer';
  eleventyConfig.addGlobalData("baseUrl", baseUrl);
  

  // Настройки для входной и выходной директорий
  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
