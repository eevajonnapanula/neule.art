const { EleventyServerlessBundlerPlugin } = require('@11ty/eleventy')
const format = require('date-fns/format')
const pluginRss = require('@11ty/eleventy-plugin-rss')

const { getRiddari } = require('./helpers/getShirt')
const { getRandomColors } = require('./helpers/getRandomColors')
const { parseColors, parseAllColors } = require('./helpers/getAvailableColors')
const { adjustColor } = require('./helpers/adjustColor')
const yarnColors = require('./_data/yarnColors.json')
const translations = require('./_data/translations.json')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('img')
  eleventyConfig.addPassthroughCopy('css')

  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: 'colors',
    functionsDir: './netlify/functions/',
    copy: [
      'helpers/getShirt.js',
      'helpers/getRandomColors.js',
      'helpers/getAvailableColors.js',
      'helpers/adjustColor.js'
    ]
  })

  eleventyConfig.addPlugin(pluginRss)

  eleventyConfig.addShortcode('adjustColor', function (colorCode) {
    return adjustColor(colorCode)
  })

  eleventyConfig.addShortcode('riddari', function (a, b, c, d) {
    return getRiddari(a, b, c, b, b, c, b, d, b, c, b, d, b, c, a)
  })

  eleventyConfig.addShortcode(
    'riddariMultiple',
    function (
      main,
      sleevePrimary,
      sleeveSecondary,
      yoke1,
      yoke2,
      yoke3,
      yoke4,
      yoke5,
      yoke6,
      yoke7,
      yoke8,
      yoke9,
      yoke10,
      yoke11,
      yoke12
    ) {
      return getRiddari(
        main,
        sleevePrimary,
        sleeveSecondary,
        yoke1,
        yoke2,
        yoke3,
        yoke4,
        yoke5,
        yoke6,
        yoke7,
        yoke8,
        yoke9,
        yoke10,
        yoke11,
        yoke12
      )
    }
  )

  eleventyConfig.addShortcode('colorSelect', function (name, id, label, selectedValue, defaultValue) {
    const adjustedValue = adjustColor(selectedValue ? selectedValue : defaultValue)
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
              `<option value="${item.colorValue}" ${adjustedValue === item.colorValue ? 'selected' : ''}>${
                item.value
              } (${item.code})</option>`
          )}
        </select>
      </fieldset>`
  })

  eleventyConfig.addShortcode('urlBuilder', function (query, path, pathToServerless, locale) {
    const queryString = query ? `?a=${query.a}&b=${query.b}&c=${query.c}&d=${query.d}` : ''
    const restOfTheUrl = query ? `${pathToServerless}${queryString}` : path
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
    return `<div class="cta-link"><a href="/${locale}/patterns/riddari/colors/${colors}">${translations[locale].randomColors} </a></div>`
  })

  eleventyConfig.addShortcode('randomColorsLinkRiddariMultiple', function (locale) {
    const colorsArr = getRandomColors(yarnColors, [], 15)
    const keys = [
      'main',
      'sleevePrimary',
      'sleeveSecondary',
      'yoke1',
      'yoke2',
      'yoke3',
      'yoke4',
      'yoke5',
      'yoke6',
      'yoke7',
      'yoke8',
      'yoke9',
      'yoke10',
      'yoke11',
      'yoke12'
    ]
    const colors = `?${keys.map((key, index) => `${key}=${colorsArr[index].colorValue}`).join('&')}`
    return `<div class="cta-link"><a href="/${locale}/patterns/riddari-multiple/colors/${colors}">${translations[locale].randomColors} </a></div>`
  })

  eleventyConfig.addShortcode('colorAvailability', function (locale, ...colors) {
    return parseColors(colors, yarnColors, locale)
  })

  eleventyConfig.addShortcode('allColorAvailability', function (locale) {
    return parseAllColors(yarnColors, locale)
  })

  eleventyConfig.addShortcode('time', function (time) {
    const datetime = new Date(time)

    return `<time datetime="${time}">${format(datetime, 'dd.MM.yyyy HH:mm (OOOO)')}</time>`
  })

  eleventyConfig.addShortcode('breadcrumbs', function (breadcrumbsObj, locale, query) {
    const queryString = query ? `colors/?a=${query.a}&b=${query.b}&c=${query.c}&d=${query.d}` : ''

    return `
    <nav aria-label="${translations[locale].breadcrumbs}">
      <ol class="breadcrumbs">
        ${
          breadcrumbsObj
            ? breadcrumbsObj
                .map(
                  obj =>
                    `<li><a href="${obj.url}${obj.serverless ? queryString : ''}" ${
                      obj.current ? 'aria-current="page"' : ''
                    }>${obj.title}</a></li>`
                )
                .join('')
            : ''
        }
      </ol>
    </nav>
    `
  })

  eleventyConfig.addShortcode('update', function (update) {
    const [year, month, day] = update.datetime.split('-')

    return `<h3><time datetime="${update.datetime}">${day}.${month}.${year}</time> - ${update.title}</h3>

    <ul>
      ${update.items.map(item => `<li>${item}</li>`).join('')}
    </ul>
    `
  })

  eleventyConfig.addFilter('getNewestUpdate', function (updates) {
    return updates[0]
  })

  eleventyConfig.addFilter('toISOString', function (value) {
    const date = !!value ? new Date(value) : new Date()
    return new Date(date).toISOString()
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
