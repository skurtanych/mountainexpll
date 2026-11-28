const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }

const mountain = {
  id: 'hoverla',
  name: { ua: 'Говерла', en: 'Hoverla' },
  range: {
    ua: 'Чорногора · Івано-Франківська область',
    en: 'Chornohora · Ivano-Frankivsk Oblast',
  },
  description: { ua: 'Найвища вершина України.', en: 'The highest peak of Ukraine.' },
  altitude: '2 061 м',
  difficulty: { ua: 'Середня', en: 'Medium' },
  season: { ua: 'Червень — жовтень', en: 'June — October' },
  image: '',
}

function stubApi() {
  cy.intercept('http://localhost:3001/**', (req) => {
    if (req.method === 'OPTIONS') return req.reply({ statusCode: 204, headers: cors })

    const { pathname } = new URL(req.url)
    if (pathname === '/mountains') return req.reply({ headers: cors, body: [mountain] })
    if (pathname === '/auth/login') {
      return req.reply({
        headers: cors,
        body: { token: 'e2e-token', user: { id: 1, name: 'Hiker', email: req.body.email } },
      })
    }
    if (pathname === '/bookings') {
      return req.reply({
        headers: cors,
        body: [{ id: 1, userId: 1, mountain: mountain.id, date: '2026-12-01', status: 'pending' }],
      })
    }
    return req.reply({ statusCode: 404, headers: cors, body: {} })
  })
}

describe('Mountains Expeditions', () => {
  beforeEach(() => {
    stubApi()
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

  it('signs in and shows bookings in the profile', () => {
    cy.get('nav').contains('a', 'Mountains').click()
    cy.get('[data-testid="mountain-card-image"]').first().click()
    cy.contains('button', 'Увійти для бронювання').click()
    cy.get('input[name="email"]').clear()
    cy.get('input[name="email"]').type('e2e-hiker@example.com')
    cy.get('input[name="password"]').clear()
    cy.get('input[name="password"]').type('carpathians123')
    cy.get('form').contains('button', 'Увійти').click()

    cy.location('pathname').should('eq', '/profile')
    cy.contains('h1', 'Особистий кабінет').should('be.visible')
    cy.get('tbody tr').should('have.length', 1)
  })

  it('redirects a guest from the profile and shows 404 for unknown routes', () => {
    cy.visit('/profile')
    cy.location('pathname').should('eq', '/login')

    cy.visit('/no-such-page')
    cy.contains('h1', '404').should('be.visible')
  })
})
