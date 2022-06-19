const colorOptions = require('../../_data/colorOptions.json')
const translations = require('../../_data/translations.json')

Cypress.Commands.add('selectsHaveCorrectValues', (key, params) => {
  colorOptions[key].forEach(color => {
    cy.get(`select[id=${color.identifier}]`)
      .then($select => {
        $select.children().find('[selected]')
      })
      // params[color.queryKey] should be usable with other ways as well
      .should('have.value', params[color.queryKey])
  })
})

Cypress.Commands.add('selectsMatchParams', key => {
  cy.location('search').then($loc => {
    const params = Object.fromEntries(
      $loc
        .substring(1)
        .split('&')
        .map(item => item.split('='))
    )

    cy.selectsHaveCorrectValues(key, params)
  })
})
