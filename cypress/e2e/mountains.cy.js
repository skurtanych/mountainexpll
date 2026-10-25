describe('Mountains Expeditions', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('navigates to the catalog and opens summit details', () => {
    cy.get('nav').contains('button', 'Mountains').click()
    cy.get('.mountain-card__image').first().click()

    cy.get('[role="dialog"]')
      .should('be.visible')
      .within(() => {
        cy.get('#modal-title').should('contain.text', 'Говерла')
      })
  })

  it('signs in and records a booking', () => {
    cy.get('nav').contains('button', 'Mountains').click()
    cy.get('.mountain-card__image').first().click()
    cy.contains('button', 'Увійти для бронювання').click()
    cy.get('input[name="email"]').clear()
    cy.get('input[name="email"]').type('e2e-hiker@example.com')
    cy.get('input[name="password"]').clear()
    cy.get('input[name="password"]').type('carpathians123')
    cy.get('.login-form').contains('button', 'Увійти').click()

    cy.contains('h1', 'Особистий кабінет').should('be.visible')
    cy.contains('Маршрут додано до твоїх бронювань.').should('be.visible')
    cy.get('tbody tr').should('have.length', 4)
  })
})
