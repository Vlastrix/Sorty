/// <reference types="cypress" />

/**
 * Test de diagnóstico para verificar conectividad con el backend
 */
describe('Diagnóstico de Conexión', () => {
  it('Debe poder acceder al frontend', () => {
    cy.visit('/')
    cy.url().should('include', 'localhost:5173')
  })

  it('Debe poder hacer petición directa al backend desde Cypress', () => {
    cy.request('http://localhost:4000/health').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('ok', true)
    })
  })

  it('Debe poder hacer login desde Cypress directamente', () => {
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:4000/auth/login',
      body: {
        email: 'vladi@gmail.com',
        password: '123456'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('success', true)
      expect(response.body.data).to.have.property('token')
      expect(response.body.data).to.have.property('user')
      cy.log('Login directo funcionó:', response.body.data.user.email)
    })
  })

  it('Debe poder cargar la página de login', () => {
    cy.visit('/login')
    cy.url().should('include', '/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('exist')
  })

  it('Debe poder llenar el formulario de login', () => {
    cy.visit('/login')
    
    // Llenar email
    cy.get('input[type="email"]').type('vladi@gmail.com')
    cy.get('input[type="email"]').should('have.value', 'vladi@gmail.com')
    
    // Llenar password
    cy.get('input[type="password"]').type('123456')
    cy.get('input[type="password"]').should('have.value', '123456')
    
    // Verificar que el botón no esté disabled
    cy.get('button[type="submit"]').should('not.be.disabled')
  })

  it('Debe hacer login y ver la petición en la consola', () => {
    cy.visit('/login')
    
    cy.get('input[type="email"]').type('vladi@gmail.com')
    cy.get('input[type="password"]').type('123456')
    cy.get('button[type="submit"]').click()
    
    // Esperar a que algo pase (éxito o error)
    cy.wait(5000)
    
    // Ver si hay mensaje de error visible
    cy.get('body').then(($body) => {
      if ($body.find('.bg-red-50').length > 0) {
        cy.get('.bg-red-50').then(($error) => {
          cy.log('Error visible:', $error.text())
        })
      }
    })
    
    // Ver si el token se guardó
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token')
      if (token) {
        cy.log('Token guardado:', token.substring(0, 50) + '...')
      } else {
        cy.log('No hay token en localStorage')
      }
    })
    
    // Ver la URL actual
    cy.url().then((url) => {
      cy.log('URL actual:', url)
    })
  })
})
