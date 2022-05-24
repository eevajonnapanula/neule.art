const data = require('../_data/stock.json')
const shops = require('../_data/yarnStores.json')
const translations = require('../_data/translations.json')

const parseColors = (a, b, c, d, allColors, locale) => {
  const colors = [a, b, c, d].map(item => {
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

  return `<li class="yarn-availability">
            <div class="color-swatch yarn-available-swatch" style="background-color: #${color}"></div>
            <h2>${yarnName} (${yarnCode})</h2>
            <div class="yarn-availability-shops">
             ${
               shopAvailability.length > 0
                 ? `${translations[locale].yarnAvailability.availableIn} <ul>${shopAvailability
                     .map(item => `<li><a href="${shops[item].linkToStock}">${shops[item].name}</a></li>`)
                     .join('')}</ul>`
                 : `${translations[locale].yarnAvailability.notAvailable} ${Object.values(shops)
                     .map(shop => shop.name)
                     .join(', ')}`
             }
              
            </div>
          </li>`
}

module.exports = {
  parseColors
}
