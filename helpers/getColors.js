const { default: axios } = require('axios')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const prevStock = require('../_data/stock.json')
const colors = require('../_data/yarnColors.json')
const { sendPushNotification } = require('./sendNotification')

const colorCodes = colors.map(color => color.code)

const axiosWithHeaders = url =>
  axios.get(url, { headers: { 'Accept-Encoding': 'gzip,deflate,compress' } }).catch(function (error) {
    console.log(error.toJSON())
  })

const getColorsSnurre = () => {
  return axiosWithHeaders('https://www.snurre.fi/products/istex-lettlopi?variant=37574035669144', {
    headers: { 'Accept-Encoding': 'gzip,deflate,compress' }
  }).then(data => {
    const $ = cheerio.load(data.data)
    const inputsAndLabels = $('.option-selector__btns')

    const vals = inputsAndLabels
      .find('input')
      .toArray()
      .map(val => {
        const value = $(val)
        return {
          isAvailable: !value.hasClass('is-unavailable'),
          name: value.attr('value')
        }
      })

    const stock = vals.map(variant => {
      return { available: variant.isAvailable, title: variant.name, code: variant.name.slice(0, 4) }
    })

    return stock
  })
}

const getColorsMenita = () => {
  return axiosWithHeaders('https://www.menita.fi/product/185/istex-lettlopi').then(data => {
    const $ = cheerio.load(data.data)

    const stockItems = $('.ProductForms')
      .find('.Checks')
      .children()
      .toArray()
      .map(val => $(val).text())

    let items = []
    const chunkSize = 2

    for (let i = 0; i < stockItems.length; i += chunkSize) {
      items.push(stockItems.slice(i, i + chunkSize))
    }

    const stock = items.map(item => {
      return {
        code: item[0].slice(0, 4),
        available: item[1] == 'Varastossa',
        title: item[0].slice(5)
      }
    })

    return stock
  })
}

const getColorsTitityy = () => {
  return axiosWithHeaders('https://titityy.fi/fi/product/istex-lettlopi/10037').then(data => {
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
  return axiosWithHeaders('https://lankapuutarha.fi/collections/istex-villalangat/products/istex-lettlopi').then(
    data => {
      const $ = cheerio.load(data.data)

      const json = $('.variant-input > input')
        .toArray()
        .map(val => {
          const value = $(val)

          return {
            title: value.attr('value'),
            available: !value.hasClass('disabled')
          }
        })

      return json.map(variant => {
        return {
          code: variant.title.match(/\d+/)[0],
          title: variant.title.match(/\D+/)[0].trim().replace('(', ''),
          available: variant.available
        }
      })
    }
  )
}

const getColorsLankakaisa = () => {
  return axiosWithHeaders('https://www.lanka-kaisa.fi/product/31/lettlopi-50g').then(data => {
    const $ = cheerio.load(data.data)

    const json = $('.ListProductInfo')
      .toArray()
      .map(val => {
        const value = $(val)
        const title = value.find('h3').text().trim()
        const titleText = title.match(/(\D)/g)
        const availability = value.find('dt').text().trim()
        const code = title.match(/\d{5}/)

        return {
          title: titleText && titleText.join('').replaceAll(',', '').replace('€', '').trim(),
          code: code && code[0].slice(1),
          available: availability && availability.includes('Varastossa')
        }
      })
      .filter(item => item.code)

    return json
  })
}

const getColorsPaapo = () => {
  return axiosWithHeaders('https://paapo.fi/p37677/istex-lettlopi').then(data => {
    const $ = cheerio.load(data.data)

    const json = $('.ddownlistitem.radio_wrapper > div > div:nth-child(2)')
      .toArray()
      .map(val => val.children)
      .map(([yarnName, availability]) => {
        return {
          name: yarnName.children[0].data,
          availability: availability.children[0].children[0].data
        }
      })
      .map(({ name, availability }) => {
        const code = name.substring(0, 4)
        return {
          title: name,
          code,
          available: availability === 'Varastossa'
        }
      })

    return json
  })
}

const getColorsLinnanrouva = () => {
  return axiosWithHeaders('https://linnanrouva.myshopify.com/products/istex-lettlopi-50-g').then(data => {
    const $ = cheerio.load(data.data)

    const json = $('select')
      .children()
      .toArray()
      .map(val => $(val).text().trim().split(' - ')[0])
      .map(val => {
        return {
          code: val.slice(0, 4),
          available: true,
          title: val.slice(5)
        }
      })

    return json
  })
}

const getColorsPiipashop = async () => {
  const url = 'https://piipashop.fi/category/91/lettlopi-50-g'

  const options = {
    method: 'GET'
  }
  // Use node-fetch because for some reason, this didn't work with axios
  const res = await fetch(url, options)
  const data = await res.text()

  const $ = cheerio.load(data)

  const json = $('.ProductList')
    .children()
    .toArray()
    .map(val => {
      const available = val.attribs.class.includes('Available')
      const title = $(val).find('a').text().split(',')[1].trim()
      const code = title.match(/\d{4}/)[0]

      return {
        title: title.match(/(\D)/g).join('').trim(),
        available,
        code
      }
    })

  return json
}

const getColorsSomikki = async () => {
  return axiosWithHeaders('https://www.somikki.fi/tuote/istex-lettlopi').then(data => {
    const $ = cheerio.load(data.data)

    const json = $('.product-variant .radio label')
      .toArray()
      .map(val =>
        val.children[0].data
          .trim()
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length)
      )
      .map(val => {
        return {
          title: val[0],
          code: val[0].slice(0, 4),
          available: val[1] != '(Loppu)'
        }
      })

    return json
  })
}

const getColorsDenLykkeligeSau = async () => {
  return axiosWithHeaders('https://denlykkeligesau.no/categories/lettlopi').then(data => {
    const $ = cheerio.load(data.data)

    return $('.product-box-wrapper .product_box_title_row.text-center')
      .toArray()
      .map(val => {
        const text = $(val).text().trim().slice(9)
        const code = text.match(/\d{4}/)[0]

        return {
          title: text.slice(0, text.length - 5).trim(),
          code: code,
          available: true
        }
      })
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

const findOrEmpty = (arr, code) => {
  return arr.find(item => item.code === code) || { title: '', available: false, code }
}

const writeStockFile = async () => {
  const titityy = await getColorsTitityy()
  const snurre = await getColorsSnurre()
  const menita = await getColorsMenita()
  const lankapuutarha = await getColorsLankapuutarha()
  const lankakaisa = await getColorsLankakaisa()
  const paapo = await getColorsPaapo()
  const linnanrouva = await getColorsLinnanrouva()
  const piipashop = await getColorsPiipashop()
  const somikki = await getColorsSomikki()
  const denlykkeligesau = await getColorsDenLykkeligeSau()

  const codes = Array.from(
    new Set(
      [
        ...titityy,
        ...snurre,
        ...menita,
        ...lankapuutarha,
        ...paapo,
        ...linnanrouva,
        ...piipashop,
        ...somikki,
        ...denlykkeligesau
      ].map(item => item.code)
    )
  )

  const stock = codes
    .map(code => {
      const snurreStock = findOrEmpty(snurre, code)
      const menitaStock = findOrEmpty(menita, code)
      const titityyStock = findOrEmpty(titityy, code)
      const lankapuutarhaStock = findOrEmpty(lankapuutarha, code)
      const lankakaisaStock = findOrEmpty(lankakaisa, code)
      const paapoStock = findOrEmpty(paapo, code)
      const linnanrouvaStock = findOrEmpty(linnanrouva, code)
      const piipashopStock = findOrEmpty(piipashop, code)
      const somikkiStock = findOrEmpty(somikki, code)
      const denlykkeligesauStock = findOrEmpty(denlykkeligesau, code)

      return {
        code,
        availability: {
          snurre: snurreStock.available || false,
          menita: menitaStock.available || false,
          titityy: titityyStock.available || false,
          lankapuutarha: lankapuutarhaStock.available || false,
          lankakaisa: lankakaisaStock.available || false,
          paapo: paapoStock.available || false,
          linnanrouva: linnanrouvaStock.available || false,
          piipashop: piipashopStock.available || false,
          somikki: somikkiStock.available || false,
          denlykkeligesau: denlykkeligesauStock.available || false
        },
        titles: {
          snurre: snurreStock.title || '',
          menita: menitaStock.title || '',
          titityy: titityyStock.title || '',
          lankapuutarha: lankapuutarhaStock.title || '',
          lankakaisa: lankakaisaStock.title,
          paapo: paapoStock.title,
          linnanrouva: linnanrouvaStock.title,
          piipashop: piipashopStock.title,
          somikki: somikkiStock.title,
          denlykkeligesau: denlykkeligesauStock.title
        }
      }
    })
    .filter(item => colorCodes.includes(item.code))

  const changes = stock
    .flatMap(item => {
      const prev = prevStock.stock.find(prevStockItem => item.code === prevStockItem.code)
      const change = item != null && prev != null ? compareChanges(prev, item) : undefined
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
