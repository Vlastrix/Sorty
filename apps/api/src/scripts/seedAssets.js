import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAssets() {
  console.log('Creando activos de ejemplo...')

  try {
    // Primero necesitamos obtener las categorías y usuarios
    const categories = await prisma.category.findMany()
    const users = await prisma.user.findMany()

    if (categories.length === 0) {
      console.log('No hay categorías. Ejecuta primero seedCategories.js')
      return
    }

    if (users.length === 0) {
      console.log('No hay usuarios. Crea un usuario primero.')
      return
    }

    const user = users[0] // Usar el primer usuario encontrado (creador)
    
    // Obtener diferentes usuarios para asignar activos
    // Si hay múltiples usuarios, los distribuimos, sino todos al primero
    const assignableUsers = users.slice(0, Math.min(users.length, 5))

    // Limpiar activos existentes (opcional)
    await prisma.asset.deleteMany()
    console.log('Activos existentes eliminados')

    // Buscar categorías específicas para crear activos más realistas
    const laptopsCategory = categories.find(c => c.name === 'Laptops')
    const escritoriosCategory = categories.find(c => c.name === 'Escritorios')
    const impressorasCategory = categories.find(c => c.name === 'Impresoras')
    const automovilesCategory = categories.find(c => c.name === 'Automóviles')
    const refrigeradoresCategory = categories.find(c => c.name === 'Refrigeradores')

    // Si no encuentra categorías específicas, usar las primeras disponibles
    const defaultCategory = categories[0]

    // Activos de ejemplo
    const assetsToCreate = [
      // Laptops
      {
        code: 'LAP-001',
        name: 'Laptop Dell Inspiron 15',
        description: 'Laptop para uso administrativo con Windows 11',
        brand: 'Dell',
        model: 'Inspiron 15 3000',
        serialNumber: 'DL15-2024-001',
        acquisitionCost: 850.00,
        purchaseDate: new Date('2024-01-15'),
        supplier: 'Distribuidora Tecnológica S.A.',
        usefulLife: 4,
        residualValue: 100.00,
        building: 'Edificio Principal',
        office: 'Oficina de Contabilidad',
        status: 'IN_USE',
        assignedToId: assignableUsers[0]?.id, // Asignado a usuario
        categoryId: laptopsCategory?.id || defaultCategory.id,
        createdById: user.id
      },
      {
        code: 'LAP-002',
        name: 'MacBook Pro 14"',
        description: 'Laptop para diseño gráfico y desarrollo',
        brand: 'Apple',
        model: 'MacBook Pro 14" M2',
        serialNumber: 'MBP-2024-002',
        acquisitionCost: 2100.00,
        purchaseDate: new Date('2024-02-20'),
        supplier: 'Apple Store Bolivia',
        usefulLife: 5,
        residualValue: 300.00,
        building: 'Edificio Principal',
        office: 'Departamento de Sistemas',
        status: 'AVAILABLE',
        categoryId: laptopsCategory?.id || defaultCategory.id,
        createdById: user.id
      },
      {
        code: 'LAP-003',
        name: 'Lenovo ThinkPad E14',
        description: 'Laptop empresarial con garantía extendida',
        brand: 'Lenovo',
        model: 'ThinkPad E14 Gen 4',
        serialNumber: 'TP-E14-2024-003',
        acquisitionCost: 950.00,
        purchaseDate: new Date('2024-03-10'),
        supplier: 'Lenovo Partner Bolivia',
        usefulLife: 4,
        residualValue: 120.00,
        building: 'Edificio Administrativo',
        office: 'Gerencia General',
        status: 'IN_REPAIR',
        categoryId: laptopsCategory?.id || defaultCategory.id,
        createdById: user.id
      },

      // Escritorios
      {
        code: 'ESC-001',
        name: 'Escritorio Ejecutivo Caoba',
        description: 'Escritorio de madera de caoba con 3 cajones',
        brand: 'Muebles Premium',
        model: 'Ejecutivo 150x80',
        serialNumber: 'MP-ESC-001',
        acquisitionCost: 450.00,
        purchaseDate: new Date('2023-08-15'),
        supplier: 'Mueblería Central',
        usefulLife: 10,
        residualValue: 50.00,
        building: 'Edificio Principal',
        office: 'Dirección Ejecutiva',
        status: 'IN_USE',
        assignedToId: assignableUsers[1]?.id || assignableUsers[0]?.id, // Asignado a usuario
        categoryId: escritoriosCategory?.id || defaultCategory.id,
        createdById: user.id
      },
      {
        code: 'ESC-002',
        name: 'Escritorio Modular Blanco',
        description: 'Escritorio modular con superficie melamínica',
        brand: 'OfficeMax',
        model: 'Modular 120x60',
        serialNumber: 'OM-MOD-002',
        acquisitionCost: 280.00,
        purchaseDate: new Date('2024-01-25'),
        supplier: 'OfficeMax Bolivia',
        usefulLife: 8,
        residualValue: 30.00,
        building: 'Edificio Principal',
        office: 'Recursos Humanos',
        status: 'AVAILABLE',
        categoryId: escritoriosCategory?.id || defaultCategory.id,
        createdById: user.id
      },

      // Impresoras
      {
        code: 'IMP-001',
        name: 'Impresora HP LaserJet Pro',
        description: 'Impresora láser monocromática para oficina',
        brand: 'HP',
        model: 'LaserJet Pro M404n',
        serialNumber: 'HP-LJ-404-001',
        acquisitionCost: 320.00,
        purchaseDate: new Date('2024-02-14'),
        supplier: 'HP Store La Paz',
        usefulLife: 5,
        residualValue: 40.00,
        building: 'Edificio Principal',
        office: 'Secretaría General',
        status: 'IN_USE',
        assignedToId: assignableUsers[2]?.id || assignableUsers[0]?.id, // Asignado a usuario
        categoryId: impressorasCategory?.id || defaultCategory.id,
        createdById: user.id
      },
      {
        code: 'IMP-002',
        name: 'Impresora Canon Multifuncional',
        description: 'Impresora multifuncional con escáner y fax',
        brand: 'Canon',
        model: 'PIXMA G6020',
        serialNumber: 'CN-G6020-002',
        acquisitionCost: 420.00,
        purchaseDate: new Date('2024-04-08'),
        supplier: 'Canon Autorizado',
        usefulLife: 4,
        residualValue: 60.00,
        building: 'Edificio Administrativo',
        office: 'Departamento Legal',
        status: 'AVAILABLE',
        categoryId: impressorasCategory?.id || defaultCategory.id,
        createdById: user.id
      },

      // Vehículos
      {
        code: 'VEH-001',
        name: 'Toyota Corolla 2023',
        description: 'Vehículo administrativo para uso ejecutivo',
        brand: 'Toyota',
        model: 'Corolla XEI 2.0',
        serialNumber: 'TOY-COR-2023-001',
        acquisitionCost: 18500.00,
        purchaseDate: new Date('2023-06-20'),
        supplier: 'Toyota Bolivia',
        usefulLife: 8,
        residualValue: 5000.00,
        building: 'Parqueadero Principal',
        office: 'Espacio A-15',
        status: 'IN_USE',
        assignedToId: assignableUsers[3]?.id || assignableUsers[0]?.id, // Asignado a usuario
        categoryId: automovilesCategory?.id || defaultCategory.id,
        createdById: user.id
      },
      {
        code: 'VEH-002',
        name: 'Nissan Sentra 2024',
        description: 'Vehículo para transporte de personal',
        brand: 'Nissan',
        model: 'Sentra Advance CVT',
        serialNumber: 'NIS-SEN-2024-002',
        acquisitionCost: 17200.00,
        purchaseDate: new Date('2024-01-12'),
        supplier: 'Nissan Concesionario',
        usefulLife: 8,
        residualValue: 4500.00,
        building: 'Parqueadero Externo',
        office: 'Espacio B-08',
        status: 'AVAILABLE',
        categoryId: automovilesCategory?.id || defaultCategory.id,
        createdById: user.id
      },

      // Electrodomésticos
      {
        code: 'REF-001',
        name: 'Refrigerador Samsung 260L',
        description: 'Refrigerador para cocina del personal',
        brand: 'Samsung',
        model: 'RT25M4030S8/AP',
        serialNumber: 'SAM-260L-001',
        acquisitionCost: 520.00,
        purchaseDate: new Date('2024-03-18'),
        supplier: 'Samsung Electronics',
        usefulLife: 10,
        residualValue: 80.00,
        building: 'Edificio Principal',
        office: 'Cocina Piso 2',
        status: 'IN_USE',
        assignedToId: assignableUsers[4]?.id || assignableUsers[0]?.id, // Asignado a usuario
        categoryId: refrigeradoresCategory?.id || defaultCategory.id,
        createdById: user.id
      },

      // Más activos diversos
      {
        code: 'MON-001',
        name: 'Monitor LG 24" Full HD',
        description: 'Monitor LED para estación de trabajo',
        brand: 'LG',
        model: '24MK430H-B',
        serialNumber: 'LG-24MK-001',
        acquisitionCost: 180.00,
        purchaseDate: new Date('2024-02-28'),
        supplier: 'LG Electronics',
        usefulLife: 6,
        residualValue: 25.00,
        building: 'Edificio Principal',
        office: 'Departamento de Sistemas',
        status: 'IN_USE',
        assignedToId: assignableUsers[0]?.id, // Asignado a usuario
        categoryId: categories.find(c => c.name === 'Periféricos')?.id || defaultCategory.id,
        createdById: user.id
      },
      {
        code: 'SIL-001',
        name: 'Silla Ergonómica Negra',
        description: 'Silla de oficina con soporte lumbar',
        brand: 'ErgoChair',
        model: 'Executive Pro',
        serialNumber: 'EC-EXEC-001',
        acquisitionCost: 190.00,
        purchaseDate: new Date('2024-01-30'),
        supplier: 'Muebles Ergonómicos',
        usefulLife: 7,
        residualValue: 20.00,
        building: 'Edificio Principal',
        office: 'Contabilidad',
        status: 'AVAILABLE',
        categoryId: categories.find(c => c.name === 'Sillas')?.id || defaultCategory.id,
        createdById: user.id
      },
      {
        code: 'PRO-001',
        name: 'Proyector Epson 3500 Lúmenes',
        description: 'Proyector para presentaciones corporativas',
        brand: 'Epson',
        model: 'PowerLite X49',
        serialNumber: 'EPS-X49-001',
        acquisitionCost: 680.00,
        purchaseDate: new Date('2024-04-15'),
        supplier: 'Epson Bolivia',
        usefulLife: 5,
        residualValue: 100.00,
        building: 'Edificio Principal',
        office: 'Sala de Conferencias',
        status: 'DECOMMISSIONED',
        categoryId: categories.find(c => c.name === 'Proyectores')?.id || defaultCategory.id,
        createdById: user.id
      }
    ]

    // Crear los activos
    console.log('Creando activos...')
    
    const createdAssets = []
    for (const assetData of assetsToCreate) {
      const createdAsset = await prisma.asset.create({
        data: assetData
      })
      createdAssets.push(createdAsset)
      console.log(`  Creado: ${assetData.code} - ${assetData.name}`)
    }

    // Crear asignaciones para activos IN_USE
    console.log('\nCreando asignaciones para activos en uso...')
    const assetsInUse = createdAssets.filter(a => a.status === 'IN_USE' && a.assignedToId)
    
    for (const asset of assetsInUse) {
      await prisma.assetAssignment.create({
        data: {
          assetId: asset.id,
          assignedToId: asset.assignedToId,
          assignedById: user.id, // El usuario administrador que crea el seed
          assignedAt: asset.assignedAt || new Date(),
          location: `${asset.building} - ${asset.office}`,
          reason: 'Asignación inicial de seed',
          status: 'ACTIVE'
        }
      })
      console.log(`  Asignación creada: ${asset.code}`)
    }


    // Mostrar estadísticas finales
    const totalAssets = await prisma.asset.count()
    const assetsByStatus = await prisma.asset.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const assetsByCategory = await prisma.asset.groupBy({
      by: ['categoryId'],
      _count: {
        categoryId: true
      }
    })

    console.log(`\nEstadísticas de activos creados:`)
    console.log(`   Total de activos: ${totalAssets}`)
    
    console.log(`\nPor estado:`)
    assetsByStatus.forEach(stat => {
      const statusLabels = {
        'AVAILABLE': 'Disponible',
        'IN_USE': 'En uso',
        'IN_REPAIR': 'En reparación',
        'DECOMMISSIONED': 'Dado de baja'
      }
      console.log(`   ${statusLabels[stat.status] || stat.status}: ${stat._count.status}`)
    })

    console.log(`\nPor categoría:`)
    for (const stat of assetsByCategory) {
      const category = await prisma.category.findUnique({
        where: { id: stat.categoryId },
        select: { name: true }
      })
      console.log(`   ${category?.name || 'Sin categoría'}: ${stat._count.categoryId}`)
    }

    console.log('\n¡Activos de ejemplo creados exitosamente!')
    console.log('Ahora puedes probar todas las funcionalidades del dashboard.')

  } catch (error) {
    console.error('Error al crear activos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAssets()