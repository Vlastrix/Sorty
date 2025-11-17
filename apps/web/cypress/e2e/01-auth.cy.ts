/// <reference types="cypress" />

import { LoginPage } from '../support/pages/LoginPage'

describe('Autenticación - Login y Register', () => {
  const loginPage = new LoginPage()

  beforeEach(() => {
    // Asegurarnos de que no hay sesión activa
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  describe('Login', () => {
    it('Debe permitir login con credenciales válidas', () => {
      loginPage.visit()
      loginPage.login('vladi@gmail.com', '123456')
      
      // Esperar a que se guarde el token y redirija
      cy.wait(3000)
      loginPage.assertLoginSuccess()
      
      // Verificar que estamos en el dashboard
      cy.url().should('include', '/assets')
    })

    it('Debe mostrar error con credenciales inválidas', () => {
      loginPage.visit()
      loginPage.login('usuario@invalido.com', 'passwordincorrecto')
      
      // Verificar que sigue en login y muestra error
      cy.url().should('include', '/login')
      loginPage.assertErrorVisible()
    })

    it('Debe deshabilitar el botón con email vacío', () => {
      loginPage.visit()
      loginPage.fillLoginForm('', 'password123')
      
      // El botón debe estar deshabilitado
      cy.get('button[type="submit"]').should('be.disabled')
      cy.url().should('include', '/login')
    })

    it('Debe deshabilitar el botón con password vacío', () => {
      loginPage.visit()
      loginPage.fillLoginForm('test@example.com', '')
      
      // El botón debe estar deshabilitado
      cy.get('button[type="submit"]').should('be.disabled')
      cy.url().should('include', '/login')
    })

    it.skip('Debe permitir login con diferentes roles', () => {
      // Admin
      cy.clearLocalStorage()
      cy.clearCookies()
      loginPage.visit()
      loginPage.login('admin@sorty.com', '123456')
      cy.wait(3000)
      loginPage.assertLoginSuccess()
      
      // Inventory Manager - usar cy.session para limpiar estado
      cy.clearLocalStorage()
      cy.clearCookies()
      cy.wait(1000)
      loginPage.visit()
      loginPage.login('inventario@sorty.com', '123456')
      cy.wait(3000)
      loginPage.assertLoginSuccess()
      
      // Asset Responsible
      cy.clearLocalStorage()
      cy.clearCookies()
      cy.wait(1000)
      loginPage.visit()
      loginPage.login('responsable1@sorty.com', '123456')
      cy.wait(3000)
      loginPage.assertLoginSuccess()
    })

    it('Debe mantener la sesión al recargar la página', () => {
      loginPage.visit()
      loginPage.login('vladi@gmail.com', '123456')
      cy.wait(3000)
      loginPage.assertLoginSuccess()
      
      // Recargar la página
      cy.reload()
      
      // Verificar que sigue logueado
      cy.url().should('not.include', '/login')
      cy.window().its('localStorage').invoke('getItem', 'auth_token').should('exist')
    })
  })

  describe('Navegación', () => {
    it('Debe redirigir al login si no está autenticado', () => {
      cy.visit('/assets')
      cy.url().should('include', '/login')
    })

    it('Debe poder hacer logout', () => {
      // Login
      cy.loginAsTestUser()
      cy.visit('/assets')
      
      // Buscar y hacer click en el botón de logout por su title
      cy.get('button[title="Cerrar Sesión"]').click()
      
      // Verificar que redirige al login y elimina el token
      cy.url().should('include', '/login')
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null
      })
    })
  })

  describe('Validaciones de formulario', () => {
    it('Debe validar formato de email', () => {
      loginPage.visit()
      loginPage.fillLoginForm('emailinvalido', 'password123')
      loginPage.submit()
      
      // HTML5 validation debe prevenir el submit
      cy.url().should('include', '/login')
    })

    it('Debe permitir copiar y pegar en los campos', () => {
      loginPage.visit()
      
      const email = 'test@example.com'
      const password = 'password123'
      
      // Simular copiar/pegar
      cy.get('input[type="email"]').invoke('val', email).trigger('change')
      cy.get('input[type="password"]').invoke('val', password).trigger('change')
      
      // Verificar que los valores se pegaron correctamente
      cy.get('input[type="email"]').should('have.value', email)
      cy.get('input[type="password"]').should('have.value', password)
    })
  })
})
