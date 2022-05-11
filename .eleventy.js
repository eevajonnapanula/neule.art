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
    function (name, id, label, selectedValue, defaultValue) {
      const valueToUse = selectedValue ?? defaultValue;

      return ` 
      <fieldset>
      <label for="${id}">${label}:</label>
    <select id="${id}" name="${name}">
      <option value="red" ${valueToUse === "red" ? "selected" : ""}>Red</option>
      <option value="green" ${
        valueToUse === "green" ? "selected" : ""
      }>green</option>
      <option value="orange" ${
        valueToUse === "orange" ? "selected" : ""
      }>orange</option>
      <option value="blue" ${
        valueToUse === "blue" ? "selected" : ""
      }>blue</option>
      <option value="white" ${
        valueToUse === "white" ? "selected" : ""
      }>white</option>
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
