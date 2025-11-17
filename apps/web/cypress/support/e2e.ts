// ***********************************************************
// Este archivo se ejecuta antes de cada test
// Aquí puedes colocar configuración global y comandos personalizados
// ***********************************************************

import './commands'
import '@testing-library/cypress/add-commands'

// Prevenir errores no manejados de romper los tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores específicos que no afectan los tests
  if (err.message.includes('ResizeObserver') || 
      err.message.includes('hydration')) {
    return false
  }
  return true
})

// Limpiar localStorage antes de cada test
beforeEach(() => {
  cy.clearLocalStorage()
  cy.clearCookies()
})
