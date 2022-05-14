const getRandomColors = (allColors, colors) => {
  if (colors.length === 4) {
    return colors
  } else {
    const randomColor = allColors[Math.floor(Math.random() * allColors.length)]
    const restOfTheColors = allColors.filter(item => item.code !== randomColor.code)
    const randomColors = [...colors, randomColor]
    return getRandomColors(restOfTheColors, randomColors)
  }
}

module.exports = {
  getRandomColors
}
