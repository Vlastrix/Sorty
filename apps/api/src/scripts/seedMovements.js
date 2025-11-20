import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMovements() {
  console.log('Seeding movements...');

  try {
    // Obtener usuarios y activos para relacionar
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    const inventoryManager = await prisma.user.findFirst({
      where: { role: 'INVENTORY_MANAGER' },
    });

    const assets = await prisma.asset.findMany({ take: 8 });

    if (!admin || !inventoryManager || assets.length < 5) {
      console.log('Necesitas tener usuarios y activos creados primero');
      return;
    }

    // Movimientos de ENTRADA
    const movements = [
      // Compra de laptop
      {
        assetId: assets[0].id,
        type: 'ENTRADA',
        movementType: 'COMPRA',
        description: 'Compra de laptop para el departamento de desarrollo',
        cost: 1200.00,
        quantity: 1,
        userId: admin.id,
        date: new Date('2024-01-15'),
        notes: 'Factura #A-001'
      },
      // Donación de monitores
      {
        assetId: assets[1].id,
        type: 'ENTRADA',
        movementType: 'DONACION_IN',
        description: 'Donación de monitores de la empresa XYZ',
        cost: 0,
        quantity: 3,
        userId: inventoryManager.id,
        date: new Date('2024-02-10'),
        notes: 'Donación corporativa'
      },
      // Transferencia recibida
      {
        assetId: assets[2].id,
        type: 'ENTRADA',
        movementType: 'TRANSFERENCIA_IN',
        description: 'Transferencia desde oficina central',
        cost: 0,
        quantity: 1,
        userId: inventoryManager.id,
        date: new Date('2024-03-05'),
        notes: 'Documento de transferencia #T-2024-03'
      },

      // Movimientos de SALIDA
      // Baja de equipo obsoleto
      {
        assetId: assets[3].id,
        type: 'SALIDA',
        movementType: 'BAJA',
        description: 'Baja por obsolescencia tecnológica',
        cost: 0,
        quantity: 1,
        userId: admin.id,
        date: new Date('2024-04-20'),
        notes: 'Equipo con más de 5 años de uso'
      },
      // Venta de equipo
      {
        assetId: assets[4].id,
        type: 'SALIDA',
        movementType: 'VENTA',
        description: 'Venta de equipo de cómputo a empleado',
        cost: 150.00,
        quantity: 1,
        userId: inventoryManager.id,
        date: new Date('2024-05-12'),
        notes: 'Recibo #V-2024-05'
      },
      // Donación entregada
      {
        assetId: assets[5].id,
        type: 'SALIDA',
        movementType: 'DONACION_OUT',
        description: 'Donación a escuela local',
        cost: 0,
        quantity: 2,
        userId: admin.id,
        date: new Date('2024-06-08'),
        notes: 'Programa de responsabilidad social'
      },
      // Transferencia enviada
      {
        assetId: assets[6].id,
        type: 'SALIDA',
        movementType: 'TRANSFERENCIA_OUT',
        description: 'Transferencia a sucursal regional',
        cost: 0,
        quantity: 1,
        userId: inventoryManager.id,
        date: new Date('2024-07-15'),
        notes: 'Documento de transferencia #T-2024-07'
      }
    ];

    for (const movement of movements) {
      await prisma.assetMovement.create({
        data: movement,
      });
      console.log(`Movimiento creado: ${movement.movementType} - ${movement.description.substring(0, 40)}...`);
    }

    console.log(`\n${movements.length} movimientos creados exitosamente`);
  } catch (error) {
    console.error('Error al crear movimientos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMovements();
