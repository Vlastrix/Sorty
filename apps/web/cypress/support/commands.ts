// ***********************************************
// Custom commands para reutilizar en los tests
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command para hacer login
       * @example cy.login('admin@sorty.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Login como usuario de prueba por defecto
       * @example cy.loginAsTestUser()
       */
      loginAsTestUser(): Chainable<void>
      
      /**
       * Login como admin
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>
      
      /**
       * Login como inventory manager
       * @example cy.loginAsInventoryManager()
       */
      loginAsInventoryManager(): Chainable<void>
      
      /**
       * Obtener elemento por data-testid
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Resetear la base de datos (solo para testing)
       * @example cy.resetDatabase()
       */
      resetDatabase(): Chainable<void>
      
      /**
       * Crear un activo mediante API
       * @example cy.createAsset({ name: 'Test Asset', code: 'TEST-001' })
       */
      createAsset(assetData: any): Chainable<any>
      
      /**
       * Navegar a una ruta específica estando logueado
       * @example cy.navigateTo('/assets')
       */
      navigateTo(path: string): Chainable<void>
    }
  }
}

// Comando para login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type(email)
      cy.get('input[type="password"]').type(password)
      cy.get('button[type="submit"]').click()
      
      // Esperar a que redirija primero (esto indica que el login funcionó)
      cy.url({ timeout: 20000 }).should('not.include', '/login')
      
      // Luego verificar que el token existe
      cy.window().its('localStorage').invoke('getItem', 'auth_token').should('exist')
    },
    {
      validate() {
        // Validar que la sesión sigue activa
        cy.window().its('localStorage').invoke('getItem', 'auth_token').should('exist')
      },
    }
  )
})

// Login como usuario de prueba por defecto
Cypress.Commands.add('loginAsTestUser', () => {
  cy.login(
    Cypress.env('testUserEmail'),
    Cypress.env('testUserPassword')
  )
})

// Login como admin
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@sorty.com', '123456')
})

// Login como inventory manager
Cypress.Commands.add('loginAsInventoryManager', () => {
  cy.login('inventario@sorty.com', '123456')
})

// Obtener por data-testid
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})

// Resetear base de datos
Cypress.Commands.add('resetDatabase', () => {
  cy.exec('cd ../api && node src/scripts/resetDatabase.js', {
    timeout: 60000,
    failOnNonZeroExit: false
  })
})

// Crear activo mediante API
Cypress.Commands.add('createAsset', (assetData: any) => {
  return cy.window().then((win) => {
    const token = win.localStorage.getItem('auth_token')
    
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/assets`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: assetData
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body.data
    })
  })
})

// Navegar estando logueado
Cypress.Commands.add('navigateTo', (path: string) => {
  cy.visit(path)
  // Esperar a que la página cargue completamente
  cy.get('body').should('be.visible')
})

export {}
