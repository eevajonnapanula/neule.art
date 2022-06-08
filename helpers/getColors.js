const { default: axios } = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const prevStock = require('../_data/stock.json')

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
        code: variant.title.match(/\d+/)[0],
        title: variant.title.match(/\D+/)[0].trim().replace('(', ''),
        available: variant.available
      }
    })
  })
}

const getColorsLankaidea = () => {
  return axios.get('https://www.lankaidea.fi/product/731/istex-lettlopi').then(data => {
    const $ = cheerio.load(data.data)

    const json = $('.Checks')
      .find('label')
      .toArray()
      .map(val => {
        const text = $(val).text()
        const code = text.match(/\d+/)[0]

        return {
          title: text,
          code: code.length === 4 ? code : `0${code}`,
          available: !$($(val).find('input')).attr().disabled
        }
      })

    return json
  })
}

const getColorsLankakaisa = () => {
  return axios.get('https://www.lanka-kaisa.fi/product/31/lettlopi-50g').then(data => {
    const $ = cheerio.load(data.data)

    const json = $('#variationscont')
      .children()
      .toArray()
      .map(val => {
        const splitted = $(val).text().split('\n')
        const [title, code] = splitted[5].trim().split(', ')
        const availableCount = parseInt(splitted[7].trim().match(/\d+/)[0])

        return {
          title,
          code: code && code.slice(1),
          available: availableCount > 0
        }
      })
      .filter(item => item.code)
    return json
  })
}

const compareChanges = (prev, curr) => {
  const changes = []
  Object.keys(prev.availability).forEach(key => {
    if (prev.availability[key] !== curr.availability[key]) {
      changes.push({
        code: prev.code,
        store: key,
        date: new Date(),
        change: curr.availability[key] ? 'added' : 'deleted'
      })
    }
  })
  return changes.length ? changes : undefined
}

const writeStockFile = async () => {
  const titityy = await getColorsTitityy()
  const snurre = await getColorsSnurre()
  const menita = await getColorsMenita()
  const lankapuutarha = await getColorsLankapuutarha()
  const lankaidea = await getColorsLankaidea()
  const lankakaisa = await getColorsLankakaisa()

  const codes = Array.from(
    new Set([...titityy, ...snurre, ...menita, ...lankapuutarha, ...lankaidea].map(item => item.code))
  )

  const stock = codes.map(code => {
    const snurreStock = snurre.find(item => item.code === code) || { title: '', available: false, code }
    const menitaStock = menita.find(item => item.code === code) || { title: '', available: false, code }
    const titityyStock = titityy.find(item => item.code === code) || { title: '', available: false, code }
    const lankapuutarhaStock = lankapuutarha.find(item => item.code === code) || { title: '', available: false, code }
    const lankaideaStock = lankaidea.find(item => item.code === code) || { title: '', available: false, code }
    const lankakaisaStock = lankakaisa.find(item => item.code === code) || { title: '', available: false, code }

    return {
      code,
      availability: {
        snurre: snurreStock.available || false,
        menita: menitaStock.available || false,
        titityy: titityyStock.available || false,
        lankapuutarha: lankapuutarhaStock.available || false,
        lankaidea: lankaideaStock.available || false,
        lankakaisa: lankakaisaStock.available || false
      },
      titles: {
        snurre: snurreStock.title || '',
        menita: menitaStock.title || '',
        titityy: titityyStock.title || '',
        lankapuutarha: lankapuutarhaStock.title || '',
        lankaidea: lankaideaStock.title || '',
        lankakaisa: lankakaisaStock.title
      }
    }
  })

  const changes = stock
    .flatMap(item => {
      const prev = prevStock.stock.find(prevStockItem => item.code === prevStockItem.code)
      const change = compareChanges(prev, item)
      return change
    })
    .filter(Boolean)

  fs.readFile('./_data/stockChanges.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    const prevData = JSON.parse(data)
    const combinedData = [...prevData, ...changes]

    const stringifiedChanges = JSON.stringify(combinedData, null, 2)
    fs.writeFile('./_data/stockChanges.json', stringifiedChanges, err => {
      if (err) throw err
      console.log('Stock changes written to file')
    })
  })

  const stringifiedStock = JSON.stringify({ stock, updated: new Date() }, null, 2)
  fs.writeFile('./_data/stock.json', stringifiedStock, err => {
    if (err) throw err
    console.log('Stock update written to file')
  })
}

writeStockFile()

module.exports = {
  getColorsSnurre,
  getColorsMenita,
  writeStockFile
}
