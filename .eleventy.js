const { EleventyServerlessBundlerPlugin } = require('@11ty/eleventy')
const format = require('date-fns/format')

const { getShirt } = require('./helpers/getShirt')
const { getRandomColors } = require('./helpers/getRandomColors')
const { parseColors } = require('./helpers/getAvailableColors')
const yarnColors = require('./_data/yarnColors.json')
const translations = require('./_data/translations.json')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('img')
  eleventyConfig.addPassthroughCopy('css')

  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: 'colors',
    functionsDir: './netlify/functions/',
    copy: ['helpers/getShirt.js', 'helpers/getRandomColors.js', 'helpers/getAvailableColors.js']
  })

  eleventyConfig.addShortcode('shirt', function (a, b, c, d) {
    return getShirt(a, b, c, d)
  })

  eleventyConfig.addShortcode('colorSelect', function (name, id, label, selectedValue, defaultValue) {
    const valueToUse = selectedValue ? selectedValue : defaultValue
    const sortedColors = yarnColors.sort((a, b) => {
      const aValue = a.value.toUpperCase()
      const bValue = b.value.toUpperCase()
      if (aValue === bValue) {
        return 0
      }

      return aValue < bValue ? -1 : 1
    })
    return ` 
      <fieldset>
        <label for="${id}">${label}:</label>
        <select id="${id}" name="${name}">
          ${sortedColors.map(
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
    const restOfTheUrl = query ? `colors/${path}${queryString}` : path
    return `/${locale}/${restOfTheUrl}`
  })

  eleventyConfig.addShortcode('visuallyHiddenText', function (text, query, locale) {
    const colors = query ? [query.a, query.b, query.c, query.d] : ['000000', '037C79', 'DC7633', 'AED6F1']

    const colorNames = colors.map(
      color =>
        yarnColors.find(yarnColor => yarnColor.colorValue === color) || { value: translations[locale].undefinedColor }
    )

    return `<div class="visually-hidden">${text}: ${colorNames.map(item => item.value).join(', ')}</div>`
  })

  eleventyConfig.addShortcode('randomColorsLink', function (locale) {
    const colorsArr = getRandomColors(yarnColors, [])
    const colors = `?a=${colorsArr[0].colorValue}&b=${colorsArr[1].colorValue}&c=${colorsArr[2].colorValue}&d=${colorsArr[3].colorValue}`
    return `<div class="cta-link"><a href="/${locale}/colors/${colors}">${translations[locale].randomColors} </a></div>`
  })

  eleventyConfig.addShortcode('colorAvailability', function (a, b, c, d, locale) {
    return parseColors(a, b, c, d, yarnColors, locale)
  })

  eleventyConfig.addShortcode('time', function (time) {
    const datetime = new Date(time)

    return `<time datetime="${time}">${format(datetime, 'dd.MM.yyyy HH:mm (OOOO)')}</time>`
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
