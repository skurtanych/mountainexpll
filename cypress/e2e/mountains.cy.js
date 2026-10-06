describe('Сторінка Карпати E2E', () => {
  it('успішно відкриває головну сторінку та показує контент', () => {
    cy.visit('/')
    cy.contains('Відкрий Карпати').should('be.visible')
    cy.contains('Вершини').should('be.visible')
    cy.contains('Про нас').should('be.visible')
  })
})
