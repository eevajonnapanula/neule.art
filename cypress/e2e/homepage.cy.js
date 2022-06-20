describe('The Home Page', () => {
  beforeEach(() => {
    cy.visit('/fi')
  })

  it('successfully loads', () => {
    cy.get('h1').contains('Neule.art')
    cy.get('a').contains('Etusivu').should('have.attr', 'aria-current')
  })

  it('navigates to english site', () => {
    cy.get('a').contains('EN').click()
    cy.url().should('include', '/en/')
    cy.get('h1').contains('Neule.art')
    cy.get('h2').contains('Color Pickers for Patterns')
    cy.get('a').contains('EN').should('have.attr', 'aria-current')
    cy.get('a').contains('FI').should('not.have.attr', 'aria-current')
  })
})
