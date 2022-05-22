const { default: axios } = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

const getColorsSnurre = () => {
  return axios
    .get('https://www.snurre.fi/collections/neulelangat/products/istex-lettlopi?variant=37574036881560')
    .then(data => {
      const $ = cheerio.load(data.data)
      const string = $('#ProductJson-product-template').contents()[0].data
      const json = JSON.parse(string)

      const stock = json.variants.map(variant => {
        return { available: variant.available, title: variant.title, code: variant.title.slice(0, 4) }
      })

      return stock
    })
}

const getColorsMenita = () => {
  return axios.get('https://www.menita.fi/product/185/istex-lettlopi').then(data => {
    const $ = cheerio.load(data.data)
    const string = $('.FormItem.BuyFormVariationSelect > select')
      .find('option')
      .toArray()
      .map(val => $(val).text())

    const stock = string.map(item => {
      return {
        code: item.slice(0, 4),
        available: item.includes('(Varastossa)'),
        title: item.split(' (')[0]
      }
    })

    return stock
  })
}

const getColorsTitityy = () => {
  return axios.get('https://titityy.fi/fi/product/istex-lettlopi/10037').then(data => {
    const $ = cheerio.load(data.data)
    const string = $('.product_picture_extra.variation_image.col-lg-2.col-xs-4.padd2')
      .toArray()
      .map(val => $(val).text())

    const stock = string.map(item => {
      const stockItem = item.trim().split('\n')

      return {
        code: stockItem[0].slice(0, 4),
        available: !stockItem[1].includes('(Tilapäisesti loppu)') || false,
        title: stockItem[0]
      }
    })

    return stock
  })
}

const getColorsLankapuutarha = () => {
  return axios.get('https://lankapuutarha.fi/collections/istex-villalangat/products/istex-lettlopi').then(data => {
    const $ = cheerio.load(data.data)

    const json = JSON.parse(
      $('#back-in-stock-helper')
        .text()
        .split('\n')
        .find(item => item.includes('_BISConfig.product'))
        .trim()
        .slice(21, -1)
    )

    return json.variants.map(variant => {
      return {
        code: variant.title.slice(-5, -1),
        title: variant.title.slice(0, -7),
        available: variant.available
      }
    })
  })
}

const writeStockFile = async () => {
  const titityy = await getColorsTitityy()
  const snurre = await getColorsSnurre()
  const menita = await getColorsMenita()
  const lankapuutarha = await getColorsLankapuutarha()

  const codes = Array.from(new Set([...titityy, ...snurre, ...menita, ...lankapuutarha].map(item => item.code)))

  const stock = codes.map(code => {
    const snurreStock = snurre.find(item => item.code === code) || { title: '', available: false, code }
    const menitaStock = menita.find(item => item.code === code) || { title: '', available: false, code }
    const titityyStock = titityy.find(item => item.code === code) || { title: '', available: false, code }
    const lankapuutarhaStock = lankapuutarha.find(item => item.code === code) || { title: '', available: false, code }

    return {
      code,
      availability: {
        snurre: snurreStock.available || false,
        menita: menitaStock.available || false,
        titityy: titityyStock.available || false,
        lankapuutarha: lankapuutarhaStock.available || false
      },
      titles: {
        snurre: snurreStock.title || '',
        menita: menitaStock.title || '',
        titityy: titityyStock.title || '',
        lankapuutarha: lankapuutarhaStock.title || ''
      }
    }
  })

  const stringified = JSON.stringify({ stock, updated: new Date() }, null, 2)
  fs.writeFile('./_data/stock.json', stringified, err => {
    if (err) throw err
    console.log('Data written to file')
  })
}

module.exports = {
  getColorsSnurre,
  getColorsMenita,
  writeStockFile
}
