require('dotenv').config();

module.exports = function(eleventyConfig) {
  // Копируем статические файлы
  eleventyConfig.addPassthroughCopy("src/css/**/*");
  eleventyConfig.addPassthroughCopy("src/js/**/*");
  eleventyConfig.addPassthroughCopy("src/images/**/*");
  eleventyConfig.addPassthroughCopy("src/fonts/**/*");
  eleventyConfig.addPassthroughCopy("src/static/**/*");

  eleventyConfig.addGlobalData("baseUrl", process.env.ELEVENTY_ENV === 'development' ? '' : process.env.BASE_URL);  
  eleventyConfig.addGlobalData("aiSearchUrl", process.env.AI_SEARCH_URL);
  eleventyConfig.addGlobalData("smartCaptchaSitekey", process.env.SMART_CAPTCHA_SITEKEY);
  eleventyConfig.addGlobalData("isDev", process.env.ELEVENTY_ENV === 'development');
  eleventyConfig.addGlobalData("isProduction", process.env.ELEVENTY_ENV === 'production');

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
