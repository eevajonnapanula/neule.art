const { EleventyServerlessBundlerPlugin } = require('@11ty/eleventy')
const { getShirt } = require('./getShirt')
const yarnColors = require('./_data/yarnColors.json')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('img')
  eleventyConfig.addPassthroughCopy('css')

  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: 'colors',
    functionsDir: './netlify/functions/',
    copy: ['getShirt.js']
  })

  eleventyConfig.addShortcode('shirt', function (a, b, c, d) {
    return getShirt(a, b, c, d)
  })

  eleventyConfig.addShortcode('shirtWithObject', function (query) {
    const { a, b, c, d } = query
    return getShirt(a, b, c, d)
  })

  eleventyConfig.addShortcode('colorSelect', function (name, id, label, selectedValue, defaultValue) {
    const valueToUse = selectedValue ? selectedValue : defaultValue

    return ` 
      <fieldset>
      <label for="${id}">${label}:</label>
    <select id="${id}" name="${name}">
      ${yarnColors.map(
        item =>
          `<option value="${item.colorValue}" ${valueToUse === item.colorValue ? 'selected' : ''}>${item.value} (${
            item.code
          })</option>`
      )}
    </select>
    </fieldset>`
  })

  eleventyConfig.addShortcode('urlBuilder', function (query, page, locale) {
    const path = page.slice(4)
    const queryString = query ? `?a=${query.a}&b=${query.b}&c=${query.c}&d=${query.d}` : ''
    const restOfTheUrl = query ? `colors/${queryString}` : path
    return `/${locale}/${restOfTheUrl}`
  })

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    pathPrefix: '/',
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site'
    }
  }
}
