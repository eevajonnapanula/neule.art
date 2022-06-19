const getRandomColors = (allColors, colors, numOfColors = 4) => {
  if (colors.length === numOfColors) {
    return colors
  } else {
    const randomColor = allColors[Math.floor(Math.random() * allColors.length)]
    const restOfTheColors = allColors.filter(item => item.code !== randomColor.code)
    const randomColors = [...colors, randomColor]
    return getRandomColors(restOfTheColors, randomColors, numOfColors)
  }
}

module.exports = {
  getRandomColors
}
