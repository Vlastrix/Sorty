/**
 * Page Object para la gestión de activos
 */
export class AssetsPage {
  // Selectores
  private createAssetButton = 'button:contains("Nuevo Activo")'
  private assetTable = 'table'
  private assetRow = 'tbody tr'
  private searchInput = 'input[type="text"]'
  
  // Modal de crear/editar activo
  private modal = '.fixed.inset-0'
  private modalCodeInput = 'input[placeholder*="ACT"]'
  private modalNameInput = 'input[placeholder*="Laptop"], input[placeholder*="nombre"]'
  private modalCategorySelect = 'select'
  private modalAcquisitionCostInput = 'input[type="number"][placeholder*="0.00"]'
  private modalUsefulLifeInput = 'input[placeholder="5"]'
  private modalSubmitButton = 'button[type="submit"]'
  private modalCancelButton = 'button:contains("Cancelar")'

  /**
   * Visitar la página de activos
   */
  visit() {
    cy.visit('/assets')
    cy.url().should('include', '/assets')
    // Esperar a que la página cargue completamente
    cy.contains('button', 'Nuevo Activo').should('be.visible')
  }

  /**
   * Click en crear nuevo activo
   */
  clickCreateAsset() {
    // Buscar el botón "Nuevo Activo"
    cy.contains('button', 'Nuevo Activo').click()
    // Esperar a que el modal sea visible
    cy.wait(500)
    cy.get(this.modal).should('be.visible')
  }

  /**
   * Llenar formulario de crear activo
   */
  fillAssetForm(data: {
    code: string
    name: string
    categoryIndex?: number
    acquisitionCost?: number
    usefulLife?: number
    building?: string
    office?: string
  }) {
    // Campos obligatorios - usar force para evitar problemas con elementos sticky
    cy.get('input[placeholder="ACT-001"]').clear().type(data.code, { force: true })
    cy.get('input[placeholder*="Laptop"]').clear().type(data.name, { force: true })
    
    // Categoría
    if (data.categoryIndex !== undefined) {
      // ESPERAR a que se carguen las categorías desde el backend
      cy.wait(1500)
      
      // Buscar específicamente el select de categoría (el que contiene la opción "Seleccionar categoría")
      cy.get('select').contains('option', 'Seleccionar categoría').parent('select').then($select => {
        // Verificar que tenga opciones
        cy.wrap($select).find('option').should('have.length.gt', 1)
        
        // Obtener todas las opciones y seleccionar la primera válida
        cy.wrap($select).find('option').then($options => {
          const values = [...$options].map(o => o.value)
          cy.log('Opciones de categoría disponibles:', values)
          
          // Seleccionar la primera opción que NO sea vacía
          const firstValidValue = values.find(v => v !== '')
          if (firstValidValue) {
            cy.wrap($select).select(firstValidValue, { force: true })
          }
        })
      })
      
      // ESPERAR después de seleccionar
      cy.wait(1000)
      
      // Verificar que se seleccionó correctamente
      cy.get('select').contains('option', 'Seleccionar categoría').parent('select').should('not.have.value', '')
    }
    
    // Costo de adquisición (si se proporciona)
    if (data.acquisitionCost !== undefined) {
      cy.get('input[type="number"]').first().clear({ force: true }).type(data.acquisitionCost.toString(), { force: true })
    }
    
    // Fecha de compra (usar la fecha por defecto)
    // No modificar si ya viene pre-llenada con hoy
    
    // Vida útil
    if (data.usefulLife !== undefined) {
      cy.get('input[placeholder="5"]').clear().type(data.usefulLife.toString())
    }
    
    // Ubicación
    if (data.building) {
      cy.get('input[placeholder*="Edificio"]').first().scrollIntoView()
      cy.wait(500) // Esperar a que sea visible
      cy.get('input[placeholder*="Edificio"]').first().clear({ force: true })
      cy.wait(500)
      cy.get('input[placeholder*="Edificio"]').first().type(data.building, { force: true })
      cy.wait(1000) // Esperar a que React actualice el estado
      // Verificar que se escribió
      cy.get('input[placeholder*="Edificio"]').first().should('have.value', data.building)
    }
    
    if (data.office) {
      cy.get('input[placeholder*="Oficina"]').first().scrollIntoView()
      cy.wait(500) // Esperar a que sea visible
      cy.get('input[placeholder*="Oficina"]').first().clear({ force: true })
      cy.wait(500)
      cy.get('input[placeholder*="Oficina"]').first().type(data.office, { force: true })
      cy.wait(1000) // Esperar a que React actualice el estado
      // Verificar que se escribió
      cy.get('input[placeholder*="Oficina"]').first().should('have.value', data.office)
    }
  }

  /**
   * Submit del formulario
   */
  submitAssetForm() {
    // Verificar que el botón no esté deshabilitado
    cy.get('button[type="submit"]').should('not.be.disabled')
    cy.get('button[type="submit"]').click({ force: true })
  }

  /**
   * Verificar que un activo aparece en la tabla
   */
  assertAssetExists(code: string) {
    cy.get(this.assetTable).should('contain', code)
  }

  /**
   * Buscar un activo
   */
  searchAsset(query: string) {
    // Buscar el input de búsqueda en la barra superior (no dentro de modales)
    cy.get('input[type="text"]').not('.fixed input').first().clear({ force: true }).type(query, { force: true })
    cy.wait(500)
  }

  /**
   * Click en editar activo
   */
  clickEditAsset(code: string) {
    // Buscar la fila del activo
    cy.get('tbody tr').contains('td', code).parent('tr').within(() => {
      // El segundo botón en cada fila es Editar (0=ver, 1=editar, 2=eliminar)
      cy.get('button').eq(1).click({ force: true })
    })
    cy.wait(500)
    cy.get(this.modal).should('be.visible')
  }

  /**
   * Click en eliminar activo
   */
  clickDeleteAsset(code: string) {
    cy.contains('tr', code)
      .find('button[title="Eliminar"], button:has([data-icon="trash"])')
      .click()
  }

  /**
   * Confirmar eliminación en modal
   */
  confirmDelete() {
    cy.contains('button', 'Eliminar').click()
  }

  /**
   * Verificar que el modal está visible
   */
  assertModalVisible() {
    cy.get(this.modal).should('be.visible')
  }

  /**
   * Verificar que el modal está cerrado
   */
  assertModalClosed() {
    cy.get(this.modal).should('not.exist')
  }

  /**
   * Cerrar modal
   */
  closeModal() {
    cy.get(this.modalCancelButton).click()
  }

  /**
   * Verificar valores por defecto cargados
   */
  assertDefaultValuesLoaded() {
    // Verificar que los campos numéricos tienen algún valor
    cy.get('input[type="number"]').first().invoke('val').should('not.be.empty')
  }
}
