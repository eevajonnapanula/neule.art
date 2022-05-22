const data = require('../_data/stock.json')
const shops = require('../_data/yarnStores.json')
const translations = require('../_data/translations.json')

const parseColors = (a, b, c, d, allColors, locale) => {
  const colorA = allColors.find(item => item.colorValue === a)
  const colorB = allColors.find(item => item.colorValue === b)
  const colorC = allColors.find(item => item.colorValue === c)
  const colorD = allColors.find(item => item.colorValue === d)

  const stockA = data.stock.find(item => item.code === colorA.code)
  const stockB = data.stock.find(item => item.code === colorB.code)
  const stockC = data.stock.find(item => item.code === colorC.code)
  const stockD = data.stock.find(item => item.code === colorD.code)

  const colors = [
    Object.assign(colorA, stockA),
    Object.assign(colorB, stockB),
    Object.assign(colorC, stockC),
    Object.assign(colorD, stockD)
  ]

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
