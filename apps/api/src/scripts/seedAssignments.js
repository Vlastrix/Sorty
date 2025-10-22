import { PrismaClient, AssignmentStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAssignments() {
  console.log('📋 Creando asignaciones de ejemplo...')

  try {
    // Obtener usuarios y activos existentes
    const admin = await prisma.user.findFirst({
      where: { email: 'vladi@gmail.com' }
    })

    const inventoryManager = await prisma.user.findFirst({
      where: { email: 'inventario@sorty.com' }
    })

    const responsable1 = await prisma.user.findFirst({
      where: { email: 'responsable1@sorty.com' }
    })

    const responsable2 = await prisma.user.findFirst({
      where: { email: 'responsable2@sorty.com' }
    })

    if (!admin || !inventoryManager || !responsable1 || !responsable2) {
      console.error('❌ Error: No se encontraron todos los usuarios necesarios')
      console.log('   Asegúrate de ejecutar seedUsers.js primero')
      return
    }

    // Obtener algunos activos
    const assets = await prisma.asset.findMany({
      take: 8
    })

    if (assets.length < 8) {
      console.error('❌ Error: No hay suficientes activos en la base de datos')
      console.log('   Asegúrate de ejecutar seedAssets.js primero')
      return
    }

    console.log('📦 Creando asignaciones...')

    // Asignación 1: Laptop asignada a responsable1 (ACTIVA)
    const assignment1 = await prisma.assetAssignment.create({
      data: {
        assetId: assets[0].id,
        assignedToId: responsable1.id,
        assignedById: inventoryManager.id,
        location: 'Edificio A, Oficina 201',
        reason: 'Asignación inicial para trabajo remoto',
        notes: 'Equipo de desarrollo',
        status: AssignmentStatus.ACTIVE
      }
    })

    // Actualizar el activo
    await prisma.asset.update({
      where: { id: assets[0].id },
      data: {
        assignedToId: responsable1.id,
        assignedAt: new Date(),
        currentLocation: 'Edificio A, Oficina 201',
        status: 'IN_USE'
      }
    })

    console.log(`  ✅ Asignación activa: ${assets[0].code} → ${responsable1.name}`)

    // Asignación 2: MacBook asignada a responsable2 (ACTIVA)
    const assignment2 = await prisma.assetAssignment.create({
      data: {
        assetId: assets[1].id,
        assignedToId: responsable2.id,
        assignedById: admin.id,
        location: 'Edificio B, Laboratorio 1',
        reason: 'Asignación para proyecto de investigación',
        notes: 'MacBook Pro para desarrollo iOS',
        status: AssignmentStatus.ACTIVE
      }
    })

    await prisma.asset.update({
      where: { id: assets[1].id },
      data: {
        assignedToId: responsable2.id,
        assignedAt: new Date(),
        currentLocation: 'Edificio B, Laboratorio 1',
        status: 'IN_USE'
      }
    })

    console.log(`  ✅ Asignación activa: ${assets[1].code} → ${responsable2.name}`)

    // Asignación 3: Escritorio a responsable1, luego DEVUELTO
    const assignment3 = await prisma.assetAssignment.create({
      data: {
        assetId: assets[2].id,
        assignedToId: responsable1.id,
        assignedById: inventoryManager.id,
        location: 'Edificio A, Oficina 150',
        reason: 'Mobiliario de oficina',
        assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Hace 30 días
        returnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
        status: AssignmentStatus.RETURNED,
        notes: 'Devuelto por cambio de área'
      }
    })

    console.log(`  ✅ Asignación devuelta: ${assets[2].code} (histórico)`)

    // Asignación 4: Monitor transferido de responsable1 a responsable2
    const assignment4a = await prisma.assetAssignment.create({
      data: {
        assetId: assets[3].id,
        assignedToId: responsable1.id,
        assignedById: inventoryManager.id,
        location: 'Edificio A, Oficina 201',
        reason: 'Asignación inicial',
        assignedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Hace 60 días
        returnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Hace 10 días
        status: AssignmentStatus.TRANSFERRED,
        notes: 'Transferido a otra área'
      }
    })

    const assignment4b = await prisma.assetAssignment.create({
      data: {
        assetId: assets[3].id,
        assignedToId: responsable2.id,
        assignedById: admin.id,
        location: 'Edificio B, Oficina 305',
        reason: 'Transferencia por necesidad del proyecto',
        notes: 'Monitor adicional para diseño',
        status: AssignmentStatus.ACTIVE
      }
    })

    await prisma.asset.update({
      where: { id: assets[3].id },
      data: {
        assignedToId: responsable2.id,
        assignedAt: new Date(),
        currentLocation: 'Edificio B, Oficina 305',
        status: 'IN_USE'
      }
    })

    console.log(`  ✅ Asignación transferida: ${assets[3].code} (${responsable1.name} → ${responsable2.name})`)

    // Asignación 5: Impresora asignada al admin (ACTIVA)
    const assignment5 = await prisma.assetAssignment.create({
      data: {
        assetId: assets[4].id,
        assignedToId: admin.id,
        assignedById: inventoryManager.id,
        location: 'Edificio Principal, Dirección',
        reason: 'Impresora para área administrativa',
        status: AssignmentStatus.ACTIVE
      }
    })

    await prisma.asset.update({
      where: { id: assets[4].id },
      data: {
        assignedToId: admin.id,
        assignedAt: new Date(),
        currentLocation: 'Edificio Principal, Dirección',
        status: 'IN_USE'
      }
    })

    console.log(`  ✅ Asignación activa: ${assets[4].code} → ${admin.name}`)

    // Resumen
    const totalAssignments = await prisma.assetAssignment.count()
    const activeAssignments = await prisma.assetAssignment.count({
      where: { status: AssignmentStatus.ACTIVE }
    })
    const returnedAssignments = await prisma.assetAssignment.count({
      where: { status: AssignmentStatus.RETURNED }
    })
    const transferredAssignments = await prisma.assetAssignment.count({
      where: { status: AssignmentStatus.TRANSFERRED }
    })

    console.log(`\n📊 Resumen de asignaciones:`)
    console.log(`   Total: ${totalAssignments}`)
    console.log(`   Activas: ${activeAssignments}`)
    console.log(`   Devueltas: ${returnedAssignments}`)
    console.log(`   Transferidas: ${transferredAssignments}`)

    console.log('\n✅ ¡Asignaciones de ejemplo creadas exitosamente!')
    console.log('💡 Ahora puedes ver el historial en /assignments')

  } catch (error) {
    console.error('❌ Error al crear asignaciones:', error)
    console.error(error.message)
  } finally {
    await prisma.$disconnect()
  }
}

seedAssignments()
