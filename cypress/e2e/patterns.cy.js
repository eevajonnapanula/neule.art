const colorOptions = require('../../_data/colorOptions.json')
const translations = require('../../_data/translations.json')

describe('Riddari Simple', () => {
  beforeEach(() => {
    cy.visit('/fi/patterns/riddari')
  })

  it('loads with default values', () => {
    cy.get('h1').contains('Valitse värit Riddariin')
    cy.get('select').should('have.length', 4)
    colorOptions.fourColors.forEach(color => {
      cy.get('label').contains(`${translations.fi.fourColorTexts[color.labelKey]}:`)
      cy.get(`select[id=${color.identifier}]`)
        .then($select => {
          $select.children().find('[selected]')
        })
        .should('have.value', color.defaultColor)
    })
  })

  it('generates random colors', () => {
    cy.get('a').contains('Näytä satunnaiset värit').click()
    cy.url().should('include', '/colors/')

    cy.selectsMatchParams('fourColors')
  })

  it('colors can be changed', () => {
    cy.get('select[name="a"]').select('023F3D')
    cy.get('select[name="b"]').select('EE1313')
    cy.get('select[name="c"]').select('094D6D')
    cy.get('select[name="d"]').select('4A235A')
    cy.get('button').contains('Katso tulos').click()
    cy.url().should('include', '/colors/')

    cy.get(`select[id="colorA"]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      .should('have.value', '023F3D')

    cy.get(`select[id="colorB"]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      .should('have.value', 'EE1313')

    cy.get(`select[id="colorC"]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      .should('have.value', '094D6D')

    cy.get(`select[id="colorD"]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      .should('have.value', '4A235A')
  })

  it('has correct values when language is switched', () => {
    cy.visit('/fi/patterns/riddari/colors/?a=2E6592&b=B3752E&c=703F03&d=FAE5D3')
    cy.get('a').contains('EN').click()
    cy.url().should('include', '/en/patterns/riddari/colors/?a=2E6592&b=B3752E&c=703F03&d=FAE5D3')
  })
})

describe('Riddari Multicolor', () => {
  beforeEach(() => {
    cy.visit('/fi/patterns/riddari-multiple')
  })

  it('loads with default values', () => {
    cy.get('h1').contains('Valitse värit Riddariin')
    cy.get('select').should('have.length', 15)
    colorOptions.multipleColors.forEach(color => {
      cy.get('label').contains(`${translations.fi.multipleColorTexts[color.labelKey]}:`)
      cy.get(`select[id=${color.identifier}]`)
        .then($select => {
          $select.children().find('[selected]')
        })
        .should('have.value', color.defaultColor)
    })
  })

  it('generates random colors', () => {
    cy.get('a').contains('Näytä satunnaiset värit').click()
    cy.url().should('include', '/colors/')

    cy.selectsMatchParams('multipleColors')
  })
})
