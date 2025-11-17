/**
 * Page Object para la página de Login
 * Encapsula los selectores y acciones de la página de login
 */
export class LoginPage {
  // Selectores
  private emailInput = 'input[type="email"]'
  private passwordInput = 'input[type="password"]'
  private submitButton = 'button[type="submit"]'
  private registerLink = 'a[href*="register"]'
  private errorMessage = '.bg-red-50'

  /**
   * Visitar la página de login
   */
  visit() {
    cy.visit('/login')
    cy.url().should('include', '/login')
  }

  /**
   * Llenar el formulario de login
   */
  fillLoginForm(email: string, password: string) {
    if (email) {
      cy.get(this.emailInput).clear().type(email)
    } else {
      cy.get(this.emailInput).clear()
    }
    
    if (password) {
      cy.get(this.passwordInput).clear().type(password)
    } else {
      cy.get(this.passwordInput).clear()
    }
  }

  /**
   * Hacer submit del formulario
   */
  submit() {
    // Click en el botón de submit
    cy.get(this.submitButton).click()
  }

  /**
   * Login completo
   */
  login(email: string, password: string) {
    this.fillLoginForm(email, password)
    this.submit()
    // Esperar un poco para que la petición se procese
    cy.wait(500)
  }

  /**
   * Verificar que el login fue exitoso
   */
  assertLoginSuccess() {
    // Verificar que redirija fuera del login primero
    cy.url({ timeout: 20000 }).should('not.include', '/login')
    // Verificar que el token existe
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('exist')
  }

  /**
   * Verificar que hay un mensaje de error
   */
  assertErrorVisible(message?: string) {
    cy.get(this.errorMessage).should('be.visible')
    if (message) {
      cy.get(this.errorMessage).should('contain', message)
    }
  }

  /**
   * Click en el link de registro
   */
  clickRegisterLink() {
    cy.get(this.registerLink).click()
    cy.url().should('include', '/register')
  }
}
