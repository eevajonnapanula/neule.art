const adjustColor = colorCode => {
  switch (colorCode.toUpperCase()) {
    // Light Beige
    case 'FAE5D3':
      return 'E0DEE3'
    // White
    case 'E3DEC9':
      return 'FEFEFE'
    // Ash
    case 'FFFFFF':
      return 'E6E9EF'
    default:
      return colorCode
  }
}

module.exports = {
  adjustColor
}
