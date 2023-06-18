describe('Check accessibility for all pages', () => {
  it('', () => {
    const screenSizes = [[1920, 1080], 'macbook-11', 'iphone-6', 'ipad-mini']
    const urls = [
      '/fi',
      '/fi/patterns/sweaters/simple',
      '/fi/patterns/sweaters/multicolor',
      '/fi/yarns/lettlopi',
      '/fi/about'
    ]

    screenSizes.forEach(size => {
      if (Cypress._.isArray(size)) {
        cy.viewport(size[0], size[1])
      } else {
        cy.viewport(size)
      }

      urls.forEach(url => {
        cy.checkAccessibility(url)
      })
    })
  })
})
