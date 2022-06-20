const data = require('../_data/stock.json')
const shops = require('../_data/yarnStores.json')
const translations = require('../_data/translations.json')

const parseColors = (colorsArr, allColors, locale) => {
  const colors = colorsArr.map(item => {
    const color = allColors.find(colorObj => colorObj.colorValue === item)
    const stock = data.stock.find(stockObj => stockObj.code === color.code)

    return Object.assign(color, stock)
  })

  return `
    <ul class="yarn-availability-list">
      ${colors.map(item => listItem(item.value, item.code, item.colorValue, item.availability, locale)).join('')}
    </ul>`
}

const listItem = (yarnName, yarnCode, color, availability, locale) => {
  const shopAvailability = Object.entries(availability)
    .filter(([, available]) => available)
    .map(([shop]) => shop)

  return `<li class="yarn-availability ${shopAvailability.length > 0 ? 'available' : 'not-available'}">
            <div class="color-swatch yarn-available-swatch" style="background-color: #${color}"></div>
            <h2>${yarnName} (${yarnCode})</h2>
            <div class="yarn-availability-shops">
             ${
               shopAvailability.length > 0
                 ? `${translations[locale].yarnAvailability.availableIn} <ul>${shopAvailability
                     .map(item => `<li><a href="${shops[item].linkToStock}">${shops[item].name}</a></li>`)
                     .join('')}</ul>`
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
