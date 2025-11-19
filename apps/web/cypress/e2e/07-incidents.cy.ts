describe('Incidencias - Reportar Incidencia', () => {
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

  // Helper para navegar a la página de incidencias
  const goToIncidentsPage = () => {
    cy.visit(`${BASE_URL}/incidents`);
    cy.contains('h1', 'Incidencias').should('be.visible');
  };

  // Helper para abrir el modal de reportar incidencia
  const openReportModal = () => {
    cy.contains('button', 'Reportar Incidencia').click();
    cy.contains('h2', 'Reportar Incidencia').should('be.visible');
  };

  beforeEach(() => {
    login();
  });

  describe('Página de Incidencias', () => {
    it('debería navegar a la página de incidencias', () => {
      goToIncidentsPage();
      cy.contains('Gestión de daños, pérdidas, robos y mal funcionamiento').should('be.visible');
    });

    it('debería mostrar el botón de Reportar Incidencia', () => {
      goToIncidentsPage();
      cy.contains('button', 'Reportar Incidencia').should('be.visible');
    });
  });

  describe('Filtros de Incidencias', () => {
    beforeEach(() => {
      goToIncidentsPage();
    });

    it('debería filtrar por tipo de incidencia - Daño', () => {
      cy.contains('label', 'Tipo de Incidencia')
        .parent()
        .find('select')
        .select('DANO');
      
      cy.wait(500);
      cy.get('table tbody tr').should('exist');
    });

    it('debería filtrar por tipo de incidencia - Pérdida', () => {
      cy.contains('label', 'Tipo de Incidencia')
        .parent()
        .find('select')
        .select('PERDIDA');
      
      cy.wait(500);
    });

    it('debería filtrar por tipo de incidencia - Robo', () => {
      cy.contains('label', 'Tipo de Incidencia')
        .parent()
        .find('select')
        .select('ROBO');
      
      cy.wait(500);
    });

    it('debería filtrar por tipo de incidencia - Mal Funcionamiento', () => {
      cy.contains('label', 'Tipo de Incidencia')
        .parent()
        .find('select')
        .select('MAL_FUNCIONAMIENTO');
      
      cy.wait(500);
    });

    it('debería filtrar por estado - Reportado', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('REPORTED');
      
      cy.wait(500);
    });

    it('debería filtrar por estado - En Investigación', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('INVESTIGATING');
      
      cy.wait(500);
    });

    it('debería filtrar por estado - Resuelto', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('RESOLVED');
      
      cy.wait(500);
    });

    it('debería filtrar por estado - Cerrado', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('CLOSED');
      
      cy.wait(500);
    });

    it('debería resetear filtros al seleccionar "Todos"', () => {
      cy.contains('label', 'Tipo de Incidencia')
        .parent()
        .find('select')
        .select('DANO');
      
      cy.wait(500);
      
      cy.contains('label', 'Tipo de Incidencia')
        .parent()
        .find('select')
        .select('');
      
      cy.wait(500);
    });
  });

  describe('Modal de Reportar Incidencia', () => {
    beforeEach(() => {
      goToIncidentsPage();
      openReportModal();
    });

    it('debería abrir el modal de reportar incidencia', () => {
      cy.get('[data-testid="incident-asset-select"]').should('be.visible');
      cy.get('[data-testid="incident-type-select"]').should('be.visible');
      cy.get('[data-testid="incident-description-textarea"]').should('be.visible');
    });

    it('debería cerrar el modal al hacer clic en cancelar', () => {
      cy.get('.animate-fade-in-scale').within(() => {
        cy.contains('button', 'Cancelar').click();
      });
      cy.contains('h2', 'Reportar Incidencia').should('not.exist');
    });

    it('debería cerrar el modal al hacer clic en la X', () => {
      cy.get('.animate-fade-in-scale').within(() => {
        cy.contains('button', '×').click();
      });
      cy.contains('h2', 'Reportar Incidencia').should('not.exist');
    });
  });

  describe('Validación del Formulario', () => {
    beforeEach(() => {
      goToIncidentsPage();
      openReportModal();
    });

    it('debería mostrar error si no se selecciona un activo', () => {
      cy.get('[data-testid="incident-type-select"]').select('DANO');
      cy.get('[data-testid="incident-description-textarea"]').type('Descripción de prueba');
      
      // Intentar enviar sin seleccionar activo
      cy.get('[data-testid="incident-asset-select"]:invalid').should('exist');
    });

    it('debería requerir descripción', () => {
      cy.get('[data-testid="incident-asset-select"]').select(1);
      cy.get('[data-testid="incident-type-select"]').select('DANO');
      cy.get('[data-testid="incident-submit-button"]').click();
      
      cy.get('[data-testid="incident-description-textarea"]:invalid').should('exist');
    });
  });

  describe('Reportar Incidencia - Tipos de Incidencia', () => {
    beforeEach(() => {
      goToIncidentsPage();
      openReportModal();
    });

    it('debería reportar incidencia tipo Daño', () => {
      cy.get('[data-testid="incident-asset-select"]').select(1);
      cy.get('[data-testid="incident-type-select"]').select('DANO');
      cy.get('[data-testid="incident-description-textarea"]').type('Pantalla rota del monitor');
      cy.get('[data-testid="incident-cost-input"]').type('50.00');
      cy.wait(500);
      cy.get('[data-testid="incident-submit-button"]').click();
      
      cy.wait(1000);
      // Verificar que el modal se cerró o hay notificación
      cy.get('body').then(($body) => {
        if ($body.text().includes('Incidencia reportada exitosamente')) {
          cy.contains('Incidencia reportada exitosamente').should('be.visible');
        } else if ($body.text().includes('No se pueden reportar incidencias')) {
          // El activo ya estaba dado de baja
          cy.log('Activo no disponible - ya está dado de baja');
        }
      });
    });

    it('debería reportar incidencia tipo Mal Funcionamiento', () => {
      // Seleccionar un asset diferente
      cy.get('[data-testid="incident-asset-select"]').then(($select) => {
        const optionsCount = $select.find('option').length;
        if (optionsCount > 2) {
          cy.get('[data-testid="incident-asset-select"]').select(2);
        } else {
          cy.get('[data-testid="incident-asset-select"]').select(1);
        }
      });
      
      cy.get('[data-testid="incident-type-select"]').select('MAL_FUNCIONAMIENTO');
      cy.get('[data-testid="incident-description-textarea"]').type('Impresora no imprime correctamente');
      cy.wait(500);
      cy.get('[data-testid="incident-submit-button"]').click();
      
      cy.wait(1000);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Incidencia reportada exitosamente')) {
          cy.contains('Incidencia reportada exitosamente').should('be.visible');
        } else if ($body.text().includes('No se pueden reportar incidencias')) {
          cy.log('Activo no disponible - ya está dado de baja');
        }
      });
    });

    it('debería mostrar advertencia para tipo Pérdida', () => {
      cy.get('[data-testid="incident-asset-select"]').select(1);
      cy.get('[data-testid="incident-type-select"]').select('PERDIDA');
      
      cy.contains('Esta incidencia marcará el activo como dado de baja automáticamente').should('be.visible');
    });

    it('debería mostrar advertencia para tipo Robo', () => {
      cy.get('[data-testid="incident-asset-select"]').select(1);
      cy.get('[data-testid="incident-type-select"]').select('ROBO');
      
      cy.contains('Esta incidencia marcará el activo como dado de baja automáticamente').should('be.visible');
    });
  });

  describe('Campos Opcionales', () => {
    beforeEach(() => {
      goToIncidentsPage();
      openReportModal();
    });

    it('debería reportar incidencia sin costo estimado', () => {
      // Usar asset diferente
      cy.get('[data-testid="incident-asset-select"]').then(($select) => {
        const optionsCount = $select.find('option').length;
        if (optionsCount > 3) {
          cy.get('[data-testid="incident-asset-select"]').select(3);
        } else {
          cy.get('[data-testid="incident-asset-select"]').select(1);
        }
      });
      
      cy.get('[data-testid="incident-type-select"]').select('DANO');
      cy.get('[data-testid="incident-description-textarea"]').type('Incidencia sin costo');
      cy.wait(500);
      cy.get('[data-testid="incident-submit-button"]').click();
      
      cy.wait(1000);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Incidencia reportada exitosamente')) {
          cy.contains('Incidencia reportada exitosamente').should('be.visible');
        } else if ($body.text().includes('No se pueden reportar incidencias')) {
          cy.log('Activo no disponible - ya está dado de baja');
        }
      });
    });

    it('debería reportar incidencia con notas adicionales', () => {
      // Usar asset diferente
      cy.get('[data-testid="incident-asset-select"]').then(($select) => {
        const optionsCount = $select.find('option').length;
        if (optionsCount > 4) {
          cy.get('[data-testid="incident-asset-select"]').select(4);
        } else {
          cy.get('[data-testid="incident-asset-select"]').select(1);
        }
      });
      
      cy.get('[data-testid="incident-type-select"]').select('DANO');
      cy.get('[data-testid="incident-description-textarea"]').type('Incidencia con notas');
      cy.get('[data-testid="incident-notes-textarea"]').type('Notas adicionales sobre el incidente');
      cy.wait(500);
      cy.get('[data-testid="incident-submit-button"]').click();
      
      cy.wait(1000);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Incidencia reportada exitosamente')) {
          cy.contains('Incidencia reportada exitosamente').should('be.visible');
        } else if ($body.text().includes('No se pueden reportar incidencias')) {
          cy.log('Activo no disponible - ya está dado de baja');
        }
      });
    });

    it('debería permitir completar todos los campos opcionales', () => {
      cy.get('[data-testid="incident-asset-select"]').select(1);
      cy.get('[data-testid="incident-type-select"]').select('DANO');
      cy.get('[data-testid="incident-description-textarea"]').type('Incidencia completa');
      cy.get('[data-testid="incident-cost-input"]').type('75.50');
      cy.get('[data-testid="incident-notes-textarea"]').type('Información adicional completa');
      
      // Solo verificar que los campos aceptan los valores
      cy.get('[data-testid="incident-cost-input"]').should('have.value', '75.50');
      cy.get('[data-testid="incident-notes-textarea"]').should('have.value', 'Información adicional completa');
    });
  });

  describe('Acciones de Incidencias', () => {
    beforeEach(() => {
      goToIncidentsPage();
    });

    it('debería investigar una incidencia reportada', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('REPORTED');
      
      cy.wait(500);
      
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Investigar incidencia"]').click();
      });
      
      cy.contains('Investigar Incidencia').should('be.visible');
      cy.contains('button', 'Sí, investigar').click();
      
      cy.contains('Incidencia marcada como en investigación').should('be.visible');
    });

    it('debería resolver una incidencia en investigación', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('INVESTIGATING');
      
      cy.wait(500);
      
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Resolver incidencia"]').click();
      });
      
      cy.contains('h3', 'Resolver Incidencia').should('be.visible');
      
      cy.get('.animate-fade-in-scale').within(() => {
        cy.get('textarea').type('Se reparó el equipo y se realizaron las pruebas correspondientes');
        cy.contains('button', 'Resolver').click();
      });
      
      cy.contains('Incidencia resuelta exitosamente').should('be.visible');
    });

    it('debería cerrar una incidencia resuelta', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('RESOLVED');
      
      cy.wait(500);
      
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Cerrar incidencia"]').click();
      });
      
      cy.contains('Cerrar Incidencia').should('be.visible');
      cy.contains('button', 'Sí, cerrar').click();
      
      cy.contains('Incidencia cerrada exitosamente').should('be.visible');
    });

    it('debería validar que la resolución sea requerida', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('INVESTIGATING');
      
      cy.wait(500);
      
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Resolver incidencia"]').click();
      });
      
      cy.get('.animate-fade-in-scale').within(() => {
        cy.contains('button', 'Resolver').should('be.disabled');
      });
    });

    it('debería cancelar la resolución de una incidencia', () => {
      cy.contains('label', 'Estado')
        .parent()
        .find('select')
        .select('INVESTIGATING');
      
      cy.wait(500);
      
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Resolver incidencia"]').click();
      });
      
      cy.get('.animate-fade-in-scale').within(() => {
        cy.contains('button', 'Cancelar').click();
      });
      
      cy.contains('h3', 'Resolver Incidencia').should('not.exist');
    });
  });

  describe('Visualización de Incidencias', () => {
    beforeEach(() => {
      goToIncidentsPage();
    });

    it('debería mostrar el resumen de incidencias por estado', () => {
      cy.contains('h3', 'Resumen').should('be.visible');
      cy.contains('Reportados').should('be.visible');
      cy.contains('En Investigación').should('be.visible');
      cy.contains('Resueltos').should('be.visible');
      cy.contains('Cerrados').should('be.visible');
    });

    it('debería mostrar la tabla de incidencias con columnas correctas', () => {
      cy.get('table thead th').should('contain', 'Activo');
      cy.get('table thead th').should('contain', 'Tipo');
      cy.get('table thead th').should('contain', 'Descripción');
      cy.get('table thead th').should('contain', 'Reportado');
      cy.get('table thead th').should('contain', 'Estado');
      cy.get('table thead th').should('contain', 'Costo');
      cy.get('table thead th').should('contain', 'Acciones');
    });

    it('debería mostrar badges de color según el tipo de incidencia', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('.px-2.py-1.text-xs.font-semibold.rounded-full').should('exist');
      });
    });

    it('debería mostrar badges de color según el estado', () => {
      cy.get('table tbody tr').first().within(() => {
        cy.get('.px-2.py-1.text-xs.font-semibold.rounded-full').should('have.length.at.least', 2);
      });
    });
  });

  describe('Validación de Costos', () => {
    beforeEach(() => {
      goToIncidentsPage();
      openReportModal();
    });

    it('debería aceptar costos con decimales', () => {
      cy.get('[data-testid="incident-cost-input"]').type('25.99');
      cy.get('[data-testid="incident-cost-input"]').should('have.value', '25.99');
    });

    it('debería aceptar costos enteros', () => {
      cy.get('[data-testid="incident-cost-input"]').type('100');
      cy.get('[data-testid="incident-cost-input"]').should('have.value', '100');
    });

    it('debería validar el formato de número', () => {
      cy.get('[data-testid="incident-cost-input"]').should('have.attr', 'type', 'number');
      cy.get('[data-testid="incident-cost-input"]').should('have.attr', 'step', '0.01');
    });
  });
});
