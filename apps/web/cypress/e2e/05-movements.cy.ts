describe('Movements E2E Tests', () => {
  const BASE_URL = 'http://localhost:5173';

  // Credenciales del usuario admin
  const adminUser = {
    email: 'admin@sorty.com',
    password: '123456',
  };

  // Helper function para hacer login
  const login = () => {
    cy.visit(`${BASE_URL}/login`);
    cy.get('input[type="email"]').type(adminUser.email);
    cy.get('input[type="password"]').type(adminUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.wait(500);
  };

  // Helper para navegar a la página de movimientos
  const goToMovementsPage = () => {
    cy.visit(`${BASE_URL}/movements`);
    cy.wait(500);
  };

  // Helper para abrir el modal de crear movimiento
  const openCreateModal = () => {
    cy.contains('button', 'Registrar Movimiento').click();
    cy.wait(500);
    cy.contains('h2', 'Registrar Movimiento de Inventario').should('be.visible');
  };

  // Helper para cerrar el modal
  const closeModal = () => {
    cy.get('button').contains('×').click();
    cy.wait(300);
  };

  beforeEach(() => {
    login();
    goToMovementsPage();
  });

  describe('Página de Movimientos', () => {
    it('Debe mostrar el título de la página', () => {
      cy.contains('h1', 'Movimientos de Inventario').should('be.visible');
    });

    it('Debe mostrar el botón de registrar movimiento', () => {
      cy.contains('button', 'Registrar Movimiento').should('be.visible');
    });

    it('Debe mostrar los filtros de tipo y subtipo', () => {
      cy.contains('label', 'Tipo de Movimiento').should('be.visible');
      cy.contains('label', 'Subtipo').should('be.visible');
    });

    it('Debe cargar la tabla de movimientos', () => {
      cy.get('table', { timeout: 10000 }).should('exist');
    });
  });

  describe('Filtros de Movimientos', () => {
    it('Debe filtrar por tipo ENTRADA', () => {
      cy.get('select').first().select('ENTRADA');
      cy.wait(1000);
      cy.get('table').should('exist');
    });

    it('Debe filtrar por tipo SALIDA', () => {
      cy.get('select').first().select('SALIDA');
      cy.wait(1000);
      cy.get('table').should('exist');
    });

    it('Debe mostrar subtipos de entrada cuando se selecciona tipo ENTRADA', () => {
      cy.get('select').first().select('ENTRADA');
      cy.wait(500);
      cy.get('select').eq(1).find('option').should('contain', 'Compra');
    });

    it('Debe mostrar subtipos de salida cuando se selecciona tipo SALIDA', () => {
      cy.get('select').first().select('SALIDA');
      cy.wait(500);
      cy.get('select').eq(1).find('option').should('contain', 'Baja');
    });
  });

  describe('Modal de Crear Movimiento', () => {
    it('Debe abrir el modal al hacer clic en Registrar Movimiento', () => {
      openCreateModal();
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('be.visible');
    });

    it('Debe cerrar el modal al hacer clic en la X', () => {
      openCreateModal();
      closeModal();
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
    });

    it('Debe cerrar el modal al hacer clic en Cancelar', () => {
      openCreateModal();
      cy.contains('button', 'Cancelar').click();
      cy.wait(300);
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
    });

    it('Debe mostrar todos los campos del formulario', () => {
      openCreateModal();
      
      cy.contains('label', 'Activo').should('be.visible');
      cy.contains('label', 'Tipo de Movimiento').should('be.visible');
      cy.contains('label', 'Subtipo').should('be.visible');
      cy.contains('label', 'Descripción').should('be.visible');
      cy.contains('label', 'Cantidad').should('be.visible');
      cy.contains('label', 'Costo (USD)').should('be.visible');
      cy.contains('label', 'Notas').should('be.visible');
    });

    it('Debe tener valores por defecto en el formulario', () => {
      openCreateModal();
      
      // Verificar que el tipo por defecto es ENTRADA
      cy.get('[data-testid="movement-type-select"]').should('have.value', 'ENTRADA');
      
      // Verificar que el subtipo por defecto es COMPRA
      cy.get('[data-testid="movement-subtype-select"]').should('have.value', 'COMPRA');
      
      // Verificar que la cantidad por defecto es 1
      cy.get('[data-testid="movement-quantity-input"]').should('have.value', '1');
    });
  });

  describe('Validación del Formulario', () => {
    it('Debe mostrar error si no se selecciona un activo', () => {
      openCreateModal();
      
      // Llenar solo la descripción
      cy.get('[data-testid="movement-description-input"]').type('Test sin activo');
      
      // Intentar enviar
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(500);
      
      // El modal no debería cerrarse (validación HTML5)
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('be.visible');
    });

    it('Debe mostrar error si no se ingresa descripción', () => {
      openCreateModal();
      
      // Seleccionar un activo
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      // No llenar descripción, intentar enviar
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(500);
      
      // El modal no debería cerrarse
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('be.visible');
    });
  });

  describe('Cambio de Tipo de Movimiento', () => {
    it('Debe cambiar los subtipos al cambiar de ENTRADA a SALIDA', () => {
      openCreateModal();
      
      // Verificar subtipos de entrada
      cy.get('[data-testid="movement-subtype-select"]').find('option').should('contain', 'Compra');
      
      // Cambiar a SALIDA
      cy.get('[data-testid="movement-type-select"]').select('SALIDA');
      cy.wait(500);
      
      // Verificar que los subtipos cambiaron
      cy.get('[data-testid="movement-subtype-select"]').should('have.value', 'BAJA');
      cy.get('[data-testid="movement-subtype-select"]').find('option').should('contain', 'Baja');
      cy.get('[data-testid="movement-subtype-select"]').find('option').should('not.contain', 'Compra');
    });

    it('Debe mostrar advertencia para movimientos de BAJA', () => {
      openCreateModal();
      
      // Cambiar a SALIDA y seleccionar BAJA
      cy.get('[data-testid="movement-type-select"]').select('SALIDA');
      cy.wait(500);
      cy.get('[data-testid="movement-subtype-select"]').select('BAJA');
      cy.wait(500);
      
      // Verificar advertencia
      cy.contains('Este movimiento marcará el activo como dado de baja').should('be.visible');
    });

    it('Debe mostrar advertencia para movimientos de DONACION_OUT', () => {
      openCreateModal();
      
      // Cambiar a SALIDA y seleccionar DONACION_OUT
      cy.get('[data-testid="movement-type-select"]').select('SALIDA');
      cy.wait(500);
      cy.get('[data-testid="movement-subtype-select"]').select('DONACION_OUT');
      cy.wait(500);
      
      // Verificar advertencia
      cy.contains('Este movimiento marcará el activo como dado de baja').should('be.visible');
    });
  });

  describe('Registro de Movimiento de ENTRADA', () => {
    it('Debe registrar una entrada tipo COMPRA exitosamente', () => {
      openCreateModal();
      
      // Seleccionar activo
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      // Tipo ya está en ENTRADA por defecto
      // Subtipo ya está en COMPRA por defecto
      
      // Llenar descripción
      cy.get('[data-testid="movement-description-input"]').type('Compra de equipo nuevo');
      
      // Llenar cantidad
      cy.get('[data-testid="movement-quantity-input"]').clear().type('2');
      
      // Llenar costo
      cy.get('[data-testid="movement-cost-input"]').type('150.50');
      
      // Llenar notas
      cy.get('[data-testid="movement-notes-textarea"]').type('Compra realizada con factura #12345');
      
      // Enviar
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      // Verificar que el modal se cerró
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      
      // Verificar que la tabla se actualizó
      cy.contains('Compra de equipo nuevo', { timeout: 5000 }).should('be.visible');
    });

    it('Debe registrar una entrada tipo DONACION_IN', () => {
      openCreateModal();
      
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      // Cambiar subtipo a DONACION_IN
      cy.get('[data-testid="movement-subtype-select"]').select('DONACION_IN');
      cy.wait(300);
      
      cy.get('[data-testid="movement-description-input"]').type('Donación recibida de empresa XYZ');
      
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      cy.contains('Donación recibida de empresa XYZ', { timeout: 5000 }).should('be.visible');
    });

    it('Debe registrar una entrada tipo TRANSFERENCIA_IN', () => {
      openCreateModal();
      
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="movement-subtype-select"]').select('TRANSFERENCIA_IN');
      cy.wait(300);
      
      cy.get('[data-testid="movement-description-input"]').type('Transferencia desde sucursal Central');
      
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      cy.contains('Transferencia desde sucursal Central', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Registro de Movimiento de SALIDA', () => {
    it('Debe registrar una salida tipo VENTA', () => {
      openCreateModal();
      
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      // Cambiar a SALIDA
      cy.get('[data-testid="movement-type-select"]').select('SALIDA');
      cy.wait(500);
      
      // Seleccionar VENTA
      cy.get('[data-testid="movement-subtype-select"]').select('VENTA');
      cy.wait(300);
      
      cy.get('[data-testid="movement-description-input"]').type('Venta a cliente externo');
      cy.get('[data-testid="movement-cost-input"]').type('200.00');
      
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      cy.contains('Venta a cliente externo', { timeout: 5000 }).should('be.visible');
    });

    it('Debe registrar una salida tipo TRANSFERENCIA_OUT', () => {
      openCreateModal();
      
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="movement-type-select"]').select('SALIDA');
      cy.wait(500);
      
      cy.get('[data-testid="movement-subtype-select"]').select('TRANSFERENCIA_OUT');
      cy.wait(300);
      
      cy.get('[data-testid="movement-description-input"]').type('Transferencia a sucursal Norte');
      
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      cy.contains('Transferencia a sucursal Norte', { timeout: 5000 }).should('be.visible');
    });

    it('Debe registrar una salida tipo BAJA y mostrar advertencia', () => {
      openCreateModal();
      
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="movement-type-select"]').select('SALIDA');
      cy.wait(500);
      
      cy.get('[data-testid="movement-subtype-select"]').select('BAJA');
      cy.wait(500);
      
      // Verificar advertencia
      cy.contains('Este movimiento marcará el activo como dado de baja').should('be.visible');
      
      cy.get('[data-testid="movement-description-input"]').type('Equipo obsoleto dado de baja');
      
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      cy.contains('Equipo obsoleto dado de baja', { timeout: 5000 }).should('be.visible');
    });

    it('Debe registrar una salida tipo DONACION_OUT', () => {
      openCreateModal();
      
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="movement-type-select"]').select('SALIDA');
      cy.wait(500);
      
      cy.get('[data-testid="movement-subtype-select"]').select('DONACION_OUT');
      cy.wait(500);
      
      cy.get('[data-testid="movement-description-input"]').type('Donación a institución educativa');
      
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      cy.contains('Donación a institución educativa', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Campos Opcionales', () => {
    it('Debe registrar un movimiento sin costo', () => {
      openCreateModal();
      
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="movement-description-input"]').type('Movimiento sin costo especificado');
      
      // No llenar el campo de costo
      
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      cy.contains('Movimiento sin costo especificado', { timeout: 5000 }).should('be.visible');
    });

    it('Debe registrar un movimiento sin notas', () => {
      openCreateModal();
      
      cy.get('[data-testid="movement-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="movement-description-input"]').type('Movimiento sin notas adicionales');
      
      // No llenar el campo de notas
      
      cy.get('[data-testid="movement-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Registrar Movimiento de Inventario').should('not.exist');
      cy.contains('Movimiento sin notas adicionales', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Visualización de Movimientos en la Tabla', () => {
    it('Debe mostrar la información completa de un movimiento', () => {
      // Verificar que la tabla tiene las columnas necesarias
      cy.contains('th', 'Fecha').should('be.visible');
      cy.contains('th', 'Tipo').should('be.visible');
      cy.contains('th', 'Activo').should('be.visible');
      cy.contains('th', 'Descripción').should('be.visible');
      cy.contains('th', 'Cantidad').should('be.visible');
      cy.contains('th', 'Costo').should('be.visible');
      cy.contains('th', 'Usuario').should('be.visible');
    });

    it('Debe mostrar el badge de color según el tipo de movimiento', () => {
      cy.get('table tbody tr', { timeout: 5000 }).first().within(() => {
        // Verificar que hay un badge (span con clases de color)
        cy.get('span[class*="bg-"]').should('exist');
      });
    });
  });

  describe('Resumen de Movimientos', () => {
    it('Debe mostrar el resumen con totales de entradas y salidas', () => {
      // Esperar a que carguen los movimientos
      cy.get('table', { timeout: 10000 }).should('exist');
      
      // Verificar que existe la sección de resumen
      cy.contains('Resumen', { timeout: 5000 }).should('be.visible');
      
      // Verificar que muestra los contadores
      cy.contains('Total Movimientos').should('be.visible');
      cy.contains('Entradas').should('be.visible');
      cy.contains('Salidas').should('be.visible');
    });
  });
});

