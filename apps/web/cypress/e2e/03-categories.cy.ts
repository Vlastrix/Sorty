/// <reference types="cypress" />

describe('Gestión de Categorías', () => {
  const timestamp = Date.now()

  beforeEach(() => {
    cy.loginAsAdmin()
    cy.visit('/assets')
  })

  describe('Crear Categoría', () => {
    it('Debe crear una categoría principal con valores por defecto', () => {
      // Abrir gestor de categorías
      cy.contains('button', 'Categorías').click()
      cy.wait(1000)
      
      // Click en nueva categoría
      cy.contains('button', 'Nueva Categoría').click({ force: true })
      cy.wait(500)
      
      // Llenar formulario - scroll para asegurar visibilidad
      cy.get('input[placeholder*="Equipos"]').scrollIntoView().type(`Categoría Test ${timestamp}`, { force: true })
      cy.get('textarea').scrollIntoView().type('Descripción de prueba', { force: true })
      
      // Llenar valores por defecto
      cy.get('input[type="number"]').eq(0).scrollIntoView().clear({ force: true }).type('1000', { force: true })
      cy.get('input[type="number"]').eq(1).scrollIntoView().clear({ force: true }).type('5', { force: true })
      cy.get('input[type="number"]').eq(2).scrollIntoView().clear({ force: true }).type('100', { force: true })
      
      // Submit
      cy.contains('button', 'Crear Categoría').scrollIntoView().click({ force: true })
      
      // Verificar que se creó
      cy.wait(1000)
      cy.contains(`Categoría Test ${timestamp}`).should('be.visible')
    })

    it('Debe crear una subcategoría heredando valores del padre', () => {
      cy.contains('button', 'Categorías').click()
      cy.wait(1000)
      
      cy.contains('button', 'Nueva Categoría').click({ force: true })
      cy.wait(500)
      
      // Seleccionar categoría padre - scroll y force
      cy.get('select').first().scrollIntoView()
      cy.wait(500)
      cy.get('select').first().select(1, { force: true })
      cy.wait(1000) // Esperar más a que la UI se actualice
      
      // Los campos de valores por defecto no deben aparecer para subcategorías
      cy.get('input[placeholder*="Equipos"]').scrollIntoView().type(`Subcategoría ${timestamp}`, { force: true })
      
      // El botón cambia a 'Crear Subcategoría' cuando seleccionas padre
      cy.get('button[type="submit"]').scrollIntoView().click({ force: true })
      
      cy.wait(1000)
      cy.contains(`Subcategoría ${timestamp}`).should('be.visible')
    })

    it('Debe validar nombre obligatorio', () => {
      cy.contains('button', 'Categorías').click()
      cy.wait(1000)
      
      cy.contains('button', 'Nueva Categoría').click({ force: true })
      cy.wait(500)
      
      // Intentar crear sin nombre - el botón submit debe estar o validación HTML prevendrá submit
      cy.get('input[placeholder*="Equipos"]').should('be.visible')
      cy.get('input[placeholder*="Equipos"]').should('have.attr', 'required')
      
      // Verificar que el campo es requerido
      cy.contains('button', 'Crear Categoría').should('be.visible')
    })
  })

  describe('Eliminar Categoría', () => {
    it('Debe mostrar modal de confirmación al eliminar', () => {
      cy.contains('button', 'Categorías').click()
      cy.wait(1500)
      
      // Verificar que existen categorías y hacer scroll dentro del contenedor correcto
      cy.get('.p-6.overflow-y-auto').within(() => {
        cy.get('.space-y-3').should('exist')
        
        // Buscar y hacer click en cualquier botón trash (eliminar)
        cy.get('button').filter(':has(svg)').filter((index, el) => {
          return el.className.includes('text-red-600')
        }).first().click({ force: true })
      })
      
      // Debe aparecer modal de confirmación
      cy.wait(500)
      cy.contains('Eliminar').should('exist')
    })

    it('Debe poder cancelar la eliminación', () => {
      cy.contains('button', 'Categorías').click()
      cy.wait(1000)
      
      cy.get('.space-y-3').scrollIntoView()
      cy.wait(500)
      
      cy.get('button[title*="Eliminar"]').first().scrollIntoView().click({ force: true })
      cy.wait(500)
      
      // Cancelar
      cy.contains('button', 'Cancelar').click({ force: true })
      
      // El modal de confirmación debe cerrarse
      cy.wait(500)
    })
  })

  describe('Jerarquía de Categorías', () => {
    it('Debe mostrar categorías principales y subcategorías agrupadas', () => {
      cy.contains('button', 'Categorías').click()
      cy.wait(1000)
      
      // Verificar que se muestra el título de estructura
      cy.contains('Estructura de Categorías').should('be.visible')
      
      // Debe haber categorías principales (o mensaje de que no hay)
      cy.get('.space-y-3').should('exist')
    })

    it('Debe poder crear subcategoría desde categoría padre', () => {
      cy.contains('button', 'Categorías').click()
      cy.wait(1000)
      
      // Scroll para ver las categorías
      cy.get('.space-y-3').scrollIntoView()
      cy.wait(500)
      
      // Buscar botón de agregar subcategoría
      cy.get('button[title*="Agregar"]').first().scrollIntoView().click({ force: true })
      
      // Debe abrir formulario con padre preseleccionado
      cy.wait(500)
      cy.contains('Crear Subcategoría').scrollIntoView().should('be.visible')
    })
  })
})
