const data = require('../_data/stock.json')
const shops = require('../_data/yarnStores.json')
const translations = require('../_data/translations.json')
const countries = require('../_data/countries.json')
const { adjustColor } = require('./adjustColor')

const parseColors = (allColors, locale) => {
  const colors = allColors
    .map(item => item.colorValue)
    .map(item => {
      const adjustedColor = adjustColor(item)
      const color = allColors.find(colorObj => colorObj.colorValue === adjustedColor)
      const stock = data.stock.find(stockObj => stockObj.code === color.code)

      return Object.assign(color, stock)
    })

  return `
    <ul class="yarn-availability-list">
      ${colors.map(item => listItem(item.value, item.code, item.colorValue, item.availability, locale, true)).join('')}
    </ul>`
}

const listItem = (yarnName, yarnCode, color, availability, locale, hideInitially = false) => {
  const shopAvailability = Object.entries(availability)
    .filter(([, available]) => available)
    .map(([shop]) => shop)

  const shopsPerCountry = Object.keys(countries)
    .map(country => country)
    .map(country => {
      return {
        country: country,
        stores: shopAvailability.filter(shop => shops[shop].country == country)
      }
    })
    .reduce((acc, curr) => {
      return {
        ...acc,
        [curr.country]: curr.stores
      }
    }, {})

  const countryList = Object.entries(shopsPerCountry)
    .map(([country, stores]) => {
      return stores.length > 0
        ? `<li>${translations[locale].countries[country]}:<ul>
        ${stores.map(store => `<li><a href="${shops[store].linkToStock}">${shops[store].name}</a></li>`).join('')}
      </ul></li>`
        : ``
    })
    .join('')

  return `<li id="${color}" class="yarn-availability ${shopAvailability.length > 0 ? 'available' : 'not-available'}" ${
    hideInitially ? 'style="display: none;"' : ''
  } >
            <div class="color-swatch yarn-available-swatch" style="background-color: #${color}"></div>
            <h2>${yarnName} (${yarnCode})</h2>
            <div class="yarn-availability-shops">
             ${
               shopAvailability.length > 0
                 ? `${translations[locale].yarnAvailability.availableIn} <ul>${countryList}</ul>`
                 : `${translations[locale].yarnAvailability.notAvailable} ${shops.stores
                     .map(shop => shops[shop].name)
                     .join(', ')}`
             }
              
            </div>
          </li>`
}

const parseAllColors = (yarnColors, locale) => {
  const colors = yarnColors
    .map(color => {
      const stock = data.stock.find(stockObj => stockObj.code === color.code)

      return Object.assign(color, stock)
    })
    .sort((a, b) => {
      const aValue = a.value.toUpperCase()
      const bValue = b.value.toUpperCase()
      if (aValue === bValue) {
        return 0
      }

      return aValue < bValue ? -1 : 1
    })

  return `<section>
            <h1>${translations[locale].colorAvailability.title}</h1>
            <input type="checkbox" name="Show available" id="show-available" /> 
            <label for="show-available">${translations[locale].colorAvailability.showOnlyAvailable}</label>
            <ul class="yarn-availability-list all-yarn">
              ${colors
                .map(item => listItem(item.value, item.code, item.colorValue, item.availability, locale))
                .join('')}
            </ul>
          </section>`
}

module.exports = {
  parseColors,
  parseAllColors
}
