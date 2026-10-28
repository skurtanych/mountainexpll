describe('Mountains Expeditions', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('navigates to the catalog and opens summit details', () => {
    cy.get('nav').contains('a', 'Mountains').click()
    cy.location('pathname').should('eq', '/mountains')
    cy.get('[data-testid="mountain-card-image"]').first().click()

    cy.get('[role="dialog"]')
      .should('be.visible')
      .within(() => {
        cy.get('#modal-title').should('contain.text', 'Говерла')
      })
  })

  it('signs in and records a booking', () => {
    cy.get('nav').contains('a', 'Mountains').click()
    cy.location('pathname').should('eq', '/mountains')
    cy.get('[data-testid="mountain-card-image"]').first().click()
    cy.contains('button', 'Увійти для бронювання').click()
    cy.get('input[name="email"]').clear()
    cy.get('input[name="email"]').type('e2e-hiker@example.com')
    cy.get('input[name="password"]').clear()
    cy.get('input[name="password"]').type('carpathians123')
    cy.get('form').contains('button', 'Увійти').click()

    cy.location('pathname').should('eq', '/profile')
    cy.contains('h1', 'Особистий кабінет').should('be.visible')
    cy.contains('Маршрут додано до твоїх бронювань.').should('be.visible')
    cy.get('tbody tr').should('have.length', 4)
  })

  it('opens a page directly by url and redirects unknown routes', () => {
    cy.visit('/mountains')
    cy.get('[data-testid="mountain-card-image"]').should('have.length.at.least', 1)

    cy.visit('/no-such-page')
    cy.location('pathname').should('eq', '/')
  })
})
