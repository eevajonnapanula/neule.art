const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const { getShirt } = require("./getShirt");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");

  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: "colors",
    functionsDir: "./netlify/functions/",
    copy: ["getShirt.js"],
  });

  eleventyConfig.addShortcode(
    "shirt",
    function (main, secondary, highlight1, highlight2) {
      return getShirt(main, secondary, highlight1, highlight2);
    }
  );

  eleventyConfig.addShortcode("shirtWithObject", function (query) {
    const { main, secondary, highlight1, highlight2 } = query;
    return getShirt(main, secondary, highlight1, highlight2);
  });

  eleventyConfig.addShortcode(
    "colorSelect",
    function (name, id, label, selectedValue) {
      return ` 
      <fieldset>
      <label for="${id}">${label}:</label>
    <select id="${id}" name="${name}">
      <option value="red" ${
        selectedValue === "red" ? "selected" : ""
      }>Red</option>
      <option value="green" ${
        selectedValue === "green" ? "selected" : ""
      }>green</option>
      <option value="orange" ${
        selectedValue === "orange" ? "selected" : ""
      }>orange</option>
      <option value="blue" ${
        selectedValue === "blue" ? "selected" : ""
      }>blue</option>
    </select>
    </fieldset>`;
    }
  );

  return {
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: "/",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
