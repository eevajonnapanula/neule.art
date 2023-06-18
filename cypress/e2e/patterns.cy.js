const colorOptions = require('../../_data/colorOptions.json')
const translations = require('../../_data/translations.json')

describe('Sweater Simple', () => {
  beforeEach(() => {
    cy.visit('/fi/patterns/sweaters/simple')
  })

  it('loads with default values', () => {
    cy.get('h1').contains('Valitse värit villapaitaan')
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
    cy.visit('/fi/patterns/sweaters/simple/colors/?a=2E6592&b=B3752E&c=703F03&d=FAE5D3')
    cy.get('a').contains('EN').click()
    cy.url().should('include', '/en/patterns/sweaters/simple/colors/?a=2E6592&b=B3752E&c=703F03&d=FAE5D3')
  })

  it('adjusts colors correctly if link contains old color code', () => {
    cy.visit('/fi/patterns/sweaters/simple/colors/?a=FFFFFF&b=B3752E&c=703F03&d=FAE5D3')
    cy.get(`select[id="colorA"]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      .should('have.value', 'E6E9EF')

    cy.get(`select[id="colorB"]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      .should('have.value', 'B3752E')
  })
})

describe('Sweater Multicolor', () => {
  beforeEach(() => {
    cy.visit('/fi/patterns/sweaters/multicolor')
  })

  it('loads with default values', () => {
    cy.get('h1').contains('Valitse värit villapaitaan')
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

  it('has correct values when language is switched', () => {
    cy.visit(
      '/fi/patterns/sweaters/multicolor/colors/?main=ffffff&sleevePrimary=56595F&sleeveSecondary=0B0B45&yoke1=07587E&yoke2=98B1C5&yoke3=037C79&yoke4=943126&yoke5=B9770E&yoke6=2D1901&yoke7=604978&yoke8=9D845F&yoke9=5D6D7E&yoke10=9DDB13&yoke11=EE1313&yoke12=023F3D'
    )
    cy.get('a').contains('EN').click()
    cy.url().should(
      'include',
      '/en/patterns/sweaters/multicolor/colors/?main=ffffff&sleevePrimary=56595F&sleeveSecondary=0B0B45&yoke1=07587E&yoke2=98B1C5&yoke3=037C79&yoke4=943126&yoke5=B9770E&yoke6=2D1901&yoke7=604978&yoke8=9D845F&yoke9=5D6D7E&yoke10=9DDB13&yoke11=EE1313&yoke12=023F3D'
    )
  })

  it('adjusts colors correctly if link contains old color code', () => {
    cy.visit(
      '/fi/patterns/sweaters/multicolor/colors/?main=ffffff&sleevePrimary=56595F&sleeveSecondary=0B0B45&yoke1=07587E&yoke2=98B1C5&yoke3=037C79&yoke4=943126&yoke5=B9770E&yoke6=2D1901&yoke7=604978&yoke8=9D845F&yoke9=5D6D7E&yoke10=9DDB13&yoke11=EE1313&yoke12=023F3D'
    )
    cy.get(`select[id="main-color"]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      .should('have.value', 'E6E9EF')

    cy.get(`select[id="sleeve-primary"]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      .should('have.value', '56595F')
  })
})
