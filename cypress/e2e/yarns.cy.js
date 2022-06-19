const yarns = require('../../_data/stock.json')

describe('Lettlopi', () => {
  it('shows all colors and toggles visibility', () => {
    cy.visit('/fi/yarns/lettlopi')
    cy.get('h1').contains('Léttlopin värit')
    cy.get('.yarn-availability').should('have.length', yarns.stock.length)
    cy.get('input[type="checkbox"]').click()
    cy.get('.available').should('be.visible').and('have.length.below', yarns.stock.length)
    cy.get('.not-available').should('not.be.visible')
    cy.get('.available').each($el => {
      cy.wrap($el.children().find('ul').children()).should('have.length.above', 0)
    })
  })

  it('links to correct url from pattern', () => {
    cy.visit('/fi/patterns/riddari')
    cy.get('a').contains('Kaikki värit').click()
    cy.url().should('include', 'yarns/lettlopi')
    cy.get('h1').contains('Léttlopin värit')
  })
})
