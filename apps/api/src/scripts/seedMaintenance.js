import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMaintenance() {
  console.log('🌱 Seeding maintenance records...');

  try {
    // Obtener usuarios y activos
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    const inventoryManager = await prisma.user.findFirst({
      where: { role: 'INVENTORY_MANAGER' },
    });

    const assets = await prisma.asset.findMany({ take: 6 });

    if (!admin || !inventoryManager || assets.length < 4) {
      console.log('⚠️  Necesitas tener usuarios y activos creados primero');
      return;
    }

    const maintenances = [
      // Mantenimiento preventivo completado
      {
        assetId: assets[0].id,
        type: 'PREVENTIVO',
        scheduledDate: new Date('2024-01-15'),
        completedDate: new Date('2024-01-15'),
        cost: 50.00,
        description: 'Limpieza general y actualización de software',
        performedBy: 'Técnico Juan Pérez',
        status: 'COMPLETED',
        userId: admin.id,
        notes: 'Mantenimiento trimestral'
      },
      // Mantenimiento correctivo completado
      {
        assetId: assets[1].id,
        type: 'CORRECTIVO',
        scheduledDate: new Date('2024-02-10'),
        completedDate: new Date('2024-02-11'),
        cost: 120.00,
        description: 'Reparación de pantalla y reemplazo de batería',
        performedBy: 'Servicio Técnico ABC',
        status: 'COMPLETED',
        userId: inventoryManager.id,
        notes: 'Garantía aplicada'
      },
      // Mantenimiento preventivo en progreso
      {
        assetId: assets[2].id,
        type: 'PREVENTIVO',
        scheduledDate: new Date('2024-10-20'),
        completedDate: null,
        cost: 75.00,
        description: 'Mantenimiento semestral de equipos de oficina',
        performedBy: 'Empresa de Mantenimiento XYZ',
        status: 'IN_PROGRESS',
        userId: admin.id,
        notes: 'En proceso'
      },
      // Mantenimiento preventivo programado (futuro)
      {
        assetId: assets[3].id,
        type: 'PREVENTIVO',
        scheduledDate: new Date('2024-11-30'),
        completedDate: null,
        cost: null,
        description: 'Revisión general y limpieza de componentes',
        performedBy: 'Técnico Interno',
        status: 'SCHEDULED',
        userId: inventoryManager.id,
        notes: 'Programado para fin de mes'
      },
      // Mantenimiento correctivo programado
      {
        assetId: assets[4].id,
        type: 'CORRECTIVO',
        scheduledDate: new Date('2024-11-15'),
        completedDate: null,
        cost: 200.00,
        description: 'Actualización de disco duro y memoria RAM',
        performedBy: 'Servicio Técnico DEF',
        status: 'SCHEDULED',
        userId: admin.id,
        notes: 'Mejora de rendimiento'
      },
      // Mantenimiento cancelado
      {
        assetId: assets[5].id,
        type: 'PREVENTIVO',
        scheduledDate: new Date('2024-09-10'),
        completedDate: null,
        cost: null,
        description: 'Mantenimiento preventivo trimestral',
        performedBy: null,
        status: 'CANCELLED',
        userId: inventoryManager.id,
        notes: 'Cancelado por baja del equipo'
      }
    ];

    for (const maintenance of maintenances) {
      await prisma.maintenance.create({
        data: maintenance,
      });
      console.log(`✅ Mantenimiento creado: ${maintenance.type} - ${maintenance.description.substring(0, 40)}... [${maintenance.status}]`);
    }

    console.log(`\n✨ ${maintenances.length} registros de mantenimiento creados exitosamente`);
  } catch (error) {
    console.error('❌ Error al crear mantenimientos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMaintenance();
