import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedIncidents() {
  console.log('Seeding incident records...');

  try {
    // Obtener usuarios y activos
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    const inventoryManager = await prisma.user.findFirst({
      where: { role: 'INVENTORY_MANAGER' },
    });

    const assets = await prisma.asset.findMany({ take: 7 });

    if (!admin || !inventoryManager || assets.length < 7) {
      console.log('Necesitas tener usuarios y activos creados primero');
      return;
    }

    const incidents = [
      // Daño reportado y cerrado
      {
        assetId: assets[0].id,
        type: 'DANO',
        reportedDate: new Date('2024-03-15'),
        resolvedDate: new Date('2024-03-20'),
        description: 'Pantalla con rayones y marcas',
        cost: 75.00,
        status: 'CLOSED',
        reportedById: inventoryManager.id,
        resolution: 'Reemplazo de protector de pantalla y limpieza profunda. El daño era superficial y no afectó el funcionamiento.',
        notes: 'Daño menor'
      },
      // Robo cerrado
      {
        assetId: assets[1].id,
        type: 'ROBO',
        reportedDate: new Date('2024-04-05'),
        resolvedDate: new Date('2024-04-10'),
        description: 'Laptop sustraída de la oficina durante el fin de semana',
        cost: 800.00,
        status: 'CLOSED',
        reportedById: admin.id,
        resolution: 'Se reportó a las autoridades y se realizó denuncia policial. Caso cerrado sin recuperación del equipo. Activo dado de baja.',
        notes: 'Denuncia policial realizada #2024-0405'
      },
      // Pérdida cerrada
      {
        assetId: assets[2].id,
        type: 'PERDIDA',
        reportedDate: new Date('2024-05-12'),
        resolvedDate: new Date('2024-05-15'),
        description: 'Mouse inalámbrico extraviado durante mudanza de oficinas',
        cost: 25.00,
        status: 'CLOSED',
        reportedById: inventoryManager.id,
        resolution: 'No se pudo recuperar el equipo. Se procedió a dar de baja y se adquirió reemplazo.',
        notes: 'Extravío durante mudanza'
      },
      // Mal funcionamiento resuelto
      {
        assetId: assets[3].id,
        type: 'MAL_FUNCIONAMIENTO',
        reportedDate: new Date('2024-06-20'),
        resolvedDate: new Date('2024-06-25'),
        description: 'Impresora no reconoce cartuchos de tinta',
        cost: 50.00,
        status: 'RESOLVED',
        reportedById: inventoryManager.id,
        resolution: 'Limpieza de contactos y actualización de firmware. Problema resuelto sin necesidad de reemplazo de piezas.',
        notes: 'Problema de firmware'
      },
      // Daño en investigación
      {
        assetId: assets[4].id,
        type: 'DANO',
        reportedDate: new Date('2024-10-15'),
        resolvedDate: null,
        description: 'Teclas del teclado no responden correctamente',
        cost: null,
        status: 'INVESTIGATING',
        reportedById: admin.id,
        resolution: null,
        notes: 'En evaluación técnica'
      },
      // Mal funcionamiento reportado
      {
        assetId: assets[5].id,
        type: 'MAL_FUNCIONAMIENTO',
        reportedDate: new Date('2024-10-20'),
        resolvedDate: null,
        description: 'Monitor presenta parpadeos intermitentes',
        cost: null,
        status: 'REPORTED',
        reportedById: inventoryManager.id,
        resolution: null,
        notes: 'Requiere diagnóstico técnico'
      },
      // Daño reportado recientemente
      {
        assetId: assets[6].id,
        type: 'DANO',
        reportedDate: new Date('2024-10-22'),
        resolvedDate: null,
        description: 'Puerto USB dañado, no reconoce dispositivos',
        cost: null,
        status: 'REPORTED',
        reportedById: admin.id,
        resolution: null,
        notes: 'Pendiente de revisión'
      }
    ];

    for (const incident of incidents) {
      await prisma.incident.create({
        data: incident,
      });
      console.log(`Incidente creado: ${incident.type} - ${incident.description.substring(0, 40)}... [${incident.status}]`);
    }

    console.log(`\n${incidents.length} registros de incidentes creados exitosamente`);
  } catch (error) {
    console.error('Error al crear incidentes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedIncidents();
