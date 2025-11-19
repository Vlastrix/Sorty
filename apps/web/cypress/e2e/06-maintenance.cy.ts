describe('Maintenance E2E Tests', () => {
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

  // Helper para navegar a la página de mantenimientos
  const goToMaintenancePage = () => {
    cy.visit(`${BASE_URL}/maintenance`);
    cy.wait(500);
  };

  // Helper para abrir el modal de programar mantenimiento
  const openCreateModal = () => {
    cy.contains('button', 'Programar Mantenimiento').click();
    cy.wait(500);
    cy.contains('h2', 'Programar Mantenimiento').should('be.visible');
  };

  // Helper para cerrar el modal
  const closeModal = () => {
    cy.get('button').contains('×').click();
    cy.wait(300);
  };

  // Helper para generar una fecha futura
  const getFutureDateTime = (daysFromNow: number = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    // Formato: YYYY-MM-DDTHH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  beforeEach(() => {
    login();
    goToMaintenancePage();
  });

  describe('Página de Mantenimientos', () => {
    it('Debe mostrar el título de la página', () => {
      cy.contains('h1', 'Mantenimientos').should('be.visible');
    });

    it('Debe mostrar el botón de programar mantenimiento', () => {
      cy.contains('button', 'Programar Mantenimiento').should('be.visible');
    });

    it('Debe mostrar los filtros de tipo y estado', () => {
      cy.contains('label', 'Tipo de Mantenimiento').should('be.visible');
      cy.contains('label', 'Estado').should('be.visible');
    });

    it('Debe cargar la tabla de mantenimientos', () => {
      cy.get('table', { timeout: 10000 }).should('exist');
    });
  });

  describe('Filtros de Mantenimientos', () => {
    it('Debe filtrar por tipo PREVENTIVO', () => {
      cy.get('select').first().select('PREVENTIVO');
      cy.wait(1000);
      cy.get('table').should('exist');
    });

    it('Debe filtrar por tipo CORRECTIVO', () => {
      cy.get('select').first().select('CORRECTIVO');
      cy.wait(1000);
      cy.get('table').should('exist');
    });

    it('Debe filtrar por estado SCHEDULED', () => {
      cy.get('select').eq(1).select('SCHEDULED');
      cy.wait(1000);
      cy.get('table').should('exist');
    });

    it('Debe filtrar por estado COMPLETED', () => {
      cy.get('select').eq(1).select('COMPLETED');
      cy.wait(1000);
      cy.get('table').should('exist');
    });

    it('Debe poder combinar filtros de tipo y estado', () => {
      cy.get('select').first().select('PREVENTIVO');
      cy.wait(500);
      cy.get('select').eq(1).select('SCHEDULED');
      cy.wait(1000);
      cy.get('table').should('exist');
    });
  });

  describe('Modal de Programar Mantenimiento', () => {
    it('Debe abrir el modal al hacer clic en Programar Mantenimiento', () => {
      openCreateModal();
      cy.contains('h2', 'Programar Mantenimiento').should('be.visible');
    });

    it('Debe cerrar el modal al hacer clic en la X', () => {
      openCreateModal();
      closeModal();
      cy.contains('h2', 'Programar Mantenimiento').should('not.exist');
    });

    it('Debe cerrar el modal al hacer clic en Cancelar', () => {
      openCreateModal();
      cy.get('.animate-fade-in-scale').within(() => {
        cy.contains('button', 'Cancelar').click();
      });
      cy.wait(300);
      cy.contains('h2', 'Programar Mantenimiento').should('not.exist');
    });

    it('Debe mostrar todos los campos del formulario', () => {
      openCreateModal();
      
      cy.contains('label', 'Activo').should('be.visible');
      cy.contains('label', 'Tipo').should('be.visible');
      cy.contains('label', 'Fecha Programada').should('be.visible');
      cy.contains('label', 'Descripción').should('be.visible');
      cy.contains('label', 'Realizado por').should('be.visible');
      cy.contains('label', 'Costo Estimado').should('be.visible');
      cy.contains('label', 'Notas').should('be.visible');
    });

    it('Debe tener valores por defecto en el formulario', () => {
      openCreateModal();
      
      // Verificar que el tipo por defecto es PREVENTIVO
      cy.get('[data-testid="maintenance-type-select"]').should('have.value', 'PREVENTIVO');
    });
  });

  describe('Validación del Formulario', () => {
    it('Debe mostrar error si no se selecciona un activo', () => {
      openCreateModal();
      
      // Llenar otros campos pero no el activo
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime());
      cy.get('[data-testid="maintenance-description-textarea"]').type('Test sin activo');
      
      // Intentar enviar
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(500);
      
      // El modal no debería cerrarse (validación HTML5)
      cy.contains('h2', 'Programar Mantenimiento').should('be.visible');
    });

    it('Debe mostrar error si no se ingresa fecha', () => {
      openCreateModal();
      
      // Seleccionar activo
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      
      // Llenar descripción pero no fecha
      cy.get('[data-testid="maintenance-description-textarea"]').type('Test sin fecha');
      
      // Intentar enviar
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(500);
      
      // El modal no debería cerrarse
      cy.contains('h2', 'Programar Mantenimiento').should('be.visible');
    });

    it('Debe mostrar error si no se ingresa descripción', () => {
      openCreateModal();
      
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime());
      
      // No llenar descripción, intentar enviar
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(500);
      
      // El modal no debería cerrarse
      cy.contains('h2', 'Programar Mantenimiento').should('be.visible');
    });
  });

  describe('Programar Mantenimiento CORRECTIVO', () => {
    it('Debe programar un mantenimiento correctivo', () => {
      openCreateModal();
      
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      
      // Cambiar a CORRECTIVO
      cy.get('[data-testid="maintenance-type-select"]').select('CORRECTIVO');
      cy.wait(300);
      
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(3));
      
      cy.get('[data-testid="maintenance-description-textarea"]').type('Reparación de falla en sistema eléctrico');
      
      cy.get('[data-testid="maintenance-performedby-input"]').type('ElectroServicios S.A.');
      
      cy.get('[data-testid="maintenance-cost-input"]').type('250.50');
      
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Programar Mantenimiento').should('not.exist');
      cy.contains('Reparación de falla en sistema eléctrico', { timeout: 5000 }).should('be.visible');
    });

    it('Debe poder programar mantenimiento correctivo urgente', () => {
      openCreateModal();
      
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="maintenance-type-select"]').select('CORRECTIVO');
      cy.wait(300);
      
      // Fecha para mañana (urgente)
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(1));
      
      cy.get('[data-testid="maintenance-description-textarea"]').type('Reparación urgente - equipo detenido');
      
      cy.get('[data-testid="maintenance-notes-textarea"]').type('URGENTE: Equipo inoperativo desde hoy');
      
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Programar Mantenimiento').should('not.exist');
      cy.contains('Reparación urgente - equipo detenido', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Campos Opcionales', () => {
    it('Debe permitir crear mantenimiento sin técnico asignado', () => {
      openCreateModal();
      
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(10));
      
      cy.get('[data-testid="maintenance-description-textarea"]').type('Mantenimiento sin técnico asignado');
      
      // No llenar "Realizado por"
      
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Programar Mantenimiento').should('not.exist');
      cy.contains('Mantenimiento sin técnico asignado', { timeout: 5000 }).should('be.visible');
    });

    it('Debe permitir crear mantenimiento sin costo estimado', () => {
      openCreateModal();
      
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(5));
      
      cy.get('[data-testid="maintenance-description-textarea"]').type('Mantenimiento sin presupuesto definido');
      
      // No llenar costo
      
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Programar Mantenimiento').should('not.exist');
      cy.contains('Mantenimiento sin presupuesto definido', { timeout: 5000 }).should('be.visible');
    });

    it('Debe permitir crear mantenimiento sin notas adicionales', () => {
      openCreateModal();
      
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(8));
      
      cy.get('[data-testid="maintenance-description-textarea"]').type('Mantenimiento estándar sin notas');
      
      // No llenar notas
      
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      cy.contains('h2', 'Programar Mantenimiento').should('not.exist');
      cy.contains('Mantenimiento estándar sin notas', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Visualización en la Tabla', () => {
    it('Debe mostrar las columnas correctas en la tabla', () => {
      cy.contains('th', 'Activo').should('be.visible');
      cy.contains('th', 'Tipo').should('be.visible');
      cy.contains('th', 'Descripción').should('be.visible');
      cy.contains('th', 'Programado').should('be.visible');
      cy.contains('th', 'Estado').should('be.visible');
      cy.contains('th', 'Costo').should('be.visible');
      cy.contains('th', 'Acciones').should('be.visible');
    });

    it('Debe mostrar badges de estado con colores correctos', () => {
      cy.get('table tbody tr', { timeout: 5000 }).first().within(() => {
        // Verificar que hay badges (span con clases de color)
        cy.get('span[class*="bg-"]').should('exist');
      });
    });

    it('Debe mostrar información completa del mantenimiento en cada fila', () => {
      cy.get('table tbody tr', { timeout: 5000 }).first().within(() => {
        // Verificar que hay un nombre de activo
        cy.get('td').eq(0).should('not.be.empty');
        // Verificar que hay un tipo
        cy.get('td').eq(1).should('not.be.empty');
        // Verificar que hay descripción
        cy.get('td').eq(2).should('not.be.empty');
      });
    });
  });

  describe('Resumen de Mantenimientos', () => {
    it('Debe mostrar el resumen con contadores por estado', () => {
      // Esperar a que carguen los mantenimientos
      cy.get('table', { timeout: 10000 }).should('exist');
      
      // Verificar que existe la sección de resumen
      cy.contains('Resumen', { timeout: 5000 }).should('be.visible');
      
      // Verificar que muestra los contadores
      cy.contains('Programados').should('be.visible');
      cy.contains('En Progreso').should('be.visible');
      cy.contains('Completados').should('be.visible');
      cy.contains('Cancelados').should('be.visible');
    });

    it('Debe mostrar números en los contadores del resumen', () => {
      cy.get('table', { timeout: 10000 }).should('exist');
      
      // Verificar que los contadores tienen números
      cy.get('.bg-blue-50 .text-2xl').should('exist');
      cy.get('.bg-yellow-50 .text-2xl').should('exist');
      cy.get('.bg-green-50 .text-2xl').should('exist');
      cy.get('.bg-gray-50 .text-2xl').should('exist');
    });
  });

  describe('Acciones de Mantenimiento', () => {
    it('Debe mostrar botones de acción para mantenimientos programados', () => {
      // Filtrar por SCHEDULED para asegurarnos de ver acciones
      cy.get('select').eq(1).select('SCHEDULED');
      cy.wait(1000);
      
      // Verificar que hay filas con botones de acción
      cy.get('table tbody tr', { timeout: 5000 }).first().within(() => {
        // Debe haber botones en la columna de acciones
        cy.get('button').should('exist');
      });
    });

    it('Debe poder iniciar un mantenimiento programado', () => {
      // Primero crear un mantenimiento para luego iniciarlo
      openCreateModal();
      
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(2));
      cy.get('[data-testid="maintenance-description-textarea"]').type('Mantenimiento para iniciar');
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      // Filtrar por SCHEDULED
      cy.get('select').eq(1).select('SCHEDULED');
      cy.wait(1000);
      
      // Buscar el mantenimiento recién creado y hacer clic en iniciar
      cy.contains('tr', 'Mantenimiento para iniciar').within(() => {
        cy.get('button[title="Iniciar mantenimiento"]').click();
      });
      
      cy.wait(500);
      
      // Confirmar en el modal
      cy.contains('button', 'Sí, iniciar').click();
      cy.wait(2000);
      
      // Verificar notificación o cambio de estado
      cy.contains('Mantenimiento iniciado exitosamente', { timeout: 5000 }).should('be.visible');
    });

    it('Debe poder cancelar un mantenimiento programado', () => {
      // Crear un mantenimiento para cancelar
      openCreateModal();
      
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(15));
      cy.get('[data-testid="maintenance-description-textarea"]').type('Mantenimiento para cancelar');
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      // Filtrar por SCHEDULED
      cy.get('select').eq(1).select('SCHEDULED');
      cy.wait(1000);
      
      // Buscar y cancelar
      cy.contains('tr', 'Mantenimiento para cancelar').within(() => {
        cy.get('button[title="Cancelar mantenimiento"]').click();
      });
      
      cy.wait(500);
      
      // Confirmar cancelación
      cy.contains('button', 'Sí, cancelar').click();
      cy.wait(2000);
      
      // Verificar notificación
      cy.contains('Mantenimiento cancelado exitosamente', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Tipos de Mantenimiento', () => {
    it('Debe poder alternar entre PREVENTIVO y CORRECTIVO en el formulario', () => {
      openCreateModal();
      
      // Verificar que PREVENTIVO está seleccionado por defecto
      cy.get('[data-testid="maintenance-type-select"]').should('have.value', 'PREVENTIVO');
      
      // Cambiar a CORRECTIVO
      cy.get('[data-testid="maintenance-type-select"]').select('CORRECTIVO');
      cy.wait(300);
      cy.get('[data-testid="maintenance-type-select"]').should('have.value', 'CORRECTIVO');
      
      // Volver a PREVENTIVO
      cy.get('[data-testid="maintenance-type-select"]').select('PREVENTIVO');
      cy.wait(300);
      cy.get('[data-testid="maintenance-type-select"]').should('have.value', 'PREVENTIVO');
    });

    it('Debe mostrar ambos tipos en la tabla después de filtrar', () => {
      // Sin filtro, deberían verse ambos tipos
      cy.get('select').first().select('');
      cy.wait(1000);
      
      // Crear un mantenimiento preventivo
      openCreateModal();
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      cy.get('[data-testid="maintenance-type-select"]').select('PREVENTIVO');
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(4));
      cy.get('[data-testid="maintenance-description-textarea"]').type('Test tipo preventivo');
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      // Crear un mantenimiento correctivo
      openCreateModal();
      cy.get('[data-testid="maintenance-asset-select"]').select(1);
      cy.wait(300);
      cy.get('[data-testid="maintenance-type-select"]').select('CORRECTIVO');
      cy.get('[data-testid="maintenance-date-input"]').type(getFutureDateTime(5));
      cy.get('[data-testid="maintenance-description-textarea"]').type('Test tipo correctivo');
      cy.get('[data-testid="maintenance-submit-button"]').click();
      cy.wait(2000);
      
      // Verificar que ambos aparecen
      cy.contains('Test tipo preventivo').should('be.visible');
      cy.contains('Test tipo correctivo').should('be.visible');
    });
  });

  describe('Validación de Fechas', () => {
    it('Debe permitir seleccionar fechas futuras', () => {
      openCreateModal();
      
      const futureDate = getFutureDateTime(30);
      
      cy.get('[data-testid="maintenance-date-input"]').type(futureDate);
      cy.get('[data-testid="maintenance-date-input"]').should('have.value', futureDate);
    });

    it('Debe aceptar diferentes rangos de fechas', () => {
      openCreateModal();
      
      // Fecha cercana (mañana)
      const tomorrow = getFutureDateTime(1);
      cy.get('[data-testid="maintenance-date-input"]').type(tomorrow);
      cy.get('[data-testid="maintenance-date-input"]').should('have.value', tomorrow);
      
      // Cambiar a fecha lejana (3 meses)
      const threeMonths = getFutureDateTime(90);
      cy.get('[data-testid="maintenance-date-input"]').clear().type(threeMonths);
      cy.get('[data-testid="maintenance-date-input"]').should('have.value', threeMonths);
    });
  });
});
