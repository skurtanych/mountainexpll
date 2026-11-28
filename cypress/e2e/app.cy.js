describe('Mountains app UI', () => {
  const cards = '[data-testid="mountain-card-image"]'

  it('redirects / to the home page', () => {
    cy.visit('/')
    cy.location('pathname').should('eq', '/home')
    cy.get('#hero-title').should('contain.text', 'Mountains')
  })

  it('opens the catalog with the "All summits" button', () => {
    cy.visit('/home')
    cy.contains('button', 'Усі вершини').scrollIntoView()
    cy.contains('button', 'Усі вершини').click({ force: true })
    cy.location('pathname').should('eq', '/mountains')
  })

  it('switches the language between UA and EN', () => {
    cy.visit('/mountains')
    cy.contains('h1', 'Карпати кличуть').should('be.visible')

    cy.get('button[aria-label="Мова"]').should('contain.text', 'UA').click()
    cy.contains('h1', 'The mountains are calling').should('be.visible')

    cy.get('button[aria-label="Language"]').should('contain.text', 'EN').click()
    cy.contains('h1', 'Карпати кличуть').should('be.visible')
  })

  it('filters mountains by name', () => {
    cy.visit('/mountains')
    cy.get('input[type="search"]').type('Говерла')
    cy.get(cards).should('have.length', 1)
    cy.contains('h3', 'Говерла').should('be.visible')
  })

  it('shows an empty state when nothing matches', () => {
    cy.visit('/mountains')
    cy.get('input[type="search"]').type('zzz')
    cy.contains('Нічого не знайдено').should('be.visible')
    cy.get(cards).should('not.exist')
  })

  it('closes the modal with the close button', () => {
    cy.visit('/mountains')
    cy.get(cards).first().click()
    cy.get('[role="dialog"]').should('be.visible')
    cy.get('button[aria-label="Закрити"]').click()
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('closes the modal with Escape', () => {
    cy.visit('/mountains')
    cy.get(cards).first().click()
    cy.get('[role="dialog"]').should('be.visible')
    cy.get('body').type('{esc}')
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('sends a guest to the login page from the booking button', () => {
    cy.visit('/mountains')
    cy.get(cards).first().click()
    cy.contains('button', 'Увійти для бронювання').click()
    cy.location('pathname').should('eq', '/login')
  })

  it('redirects a guest from /profile to /login', () => {
    cy.visit('/profile')
    cy.location('pathname').should('eq', '/login')
  })

  it('shows an error for a wrong password', () => {
    cy.visit('/login')
    cy.get('input[name="password"]').clear()
    cy.get('input[name="password"]').type('wrong-password')
    cy.get('form button[type="submit"]').click()

    cy.get('[role="status"]').should('be.visible')
    cy.location('pathname').should('eq', '/login')
  })
})
