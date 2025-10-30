import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCategories() {
  console.log('🌱 Creando categorías de ejemplo...')

  try {
    // Limpiar categorías existentes (opcional)
    await prisma.category.deleteMany()
    console.log('🧹 Categorías existentes eliminadas')

    // Crear categorías principales
    const mobiliario = await prisma.category.create({
      data: {
        name: 'Mobiliario',
        description: 'Muebles y elementos de oficina',
        defaultAcquisitionCost: 250.00,
        defaultUsefulLife: 10,
        defaultResidualValue: 25.00
      }
    })

    const equiposComputo = await prisma.category.create({
      data: {
        name: 'Equipos de Cómputo',
        description: 'Computadoras, laptops y dispositivos tecnológicos',
        defaultAcquisitionCost: 800.00,
        defaultUsefulLife: 4,
        defaultResidualValue: 100.00
      }
    })

    const vehiculos = await prisma.category.create({
      data: {
        name: 'Vehículos',
        description: 'Automóviles, camiones y vehículos de transporte',
        defaultAcquisitionCost: 15000.00,
        defaultUsefulLife: 8,
        defaultResidualValue: 3000.00
      }
    })

    const herramientas = await prisma.category.create({
      data: {
        name: 'Herramientas',
        description: 'Herramientas y equipos de trabajo',
        defaultAcquisitionCost: 150.00,
        defaultUsefulLife: 5,
        defaultResidualValue: 20.00
      }
    })

    const electrodomesticos = await prisma.category.create({
      data: {
        name: 'Electrodomésticos',
        description: 'Aparatos eléctricos para oficina',
        defaultAcquisitionCost: 400.00,
        defaultUsefulLife: 10,
        defaultResidualValue: 50.00
      }
    })

    console.log('✅ Categorías principales creadas')

    // Crear subcategorías para Equipos de Cómputo
    const subcategoriasComputo = [
      { name: 'Laptops', description: 'Computadoras portátiles' },
      { name: 'Computadoras de Escritorio', description: 'PCs de escritorio y workstations' },
      { name: 'Impresoras', description: 'Impresoras láser, inkjet y multifuncionales' },
      { name: 'Proyectores', description: 'Proyectores y pantallas para presentaciones' },
      { name: 'Servidores', description: 'Servidores y equipos de red' },
      { name: 'Periféricos', description: 'Teclados, ratones, monitores, etc.' }
    ]

    for (const sub of subcategoriasComputo) {
      await prisma.category.create({
        data: {
          name: sub.name,
          description: sub.description,
          parentId: equiposComputo.id
        }
      })
    }

    // Crear subcategorías para Mobiliario  
    const subcategoriasMobiliario = [
      { name: 'Escritorios', description: 'Mesas de trabajo y escritorios' },
      { name: 'Sillas', description: 'Sillas de oficina y ergonómicas' },
      { name: 'Archiveros', description: 'Gabinetes y archiveros' },
      { name: 'Mesas de Reuniones', description: 'Mesas para salas de juntas' },
      { name: 'Estantes', description: 'Repisas y estanterías' }
    ]

    for (const sub of subcategoriasMobiliario) {
      await prisma.category.create({
        data: {
          name: sub.name,
          description: sub.description,
          parentId: mobiliario.id
        }
      })
    }

    // Crear subcategorías para Vehículos
    const subcategoriasVehiculos = [
      { name: 'Automóviles', description: 'Vehículos ligeros para transporte' },
      { name: 'Camionetas', description: 'Vehículos de carga ligera' },
      { name: 'Camiones', description: 'Vehículos de carga pesada' },
      { name: 'Motocicletas', description: 'Vehículos de dos ruedas' }
    ]

    for (const sub of subcategoriasVehiculos) {
      await prisma.category.create({
        data: {
          name: sub.name,
          description: sub.description,
          parentId: vehiculos.id
        }
      })
    }

    // Crear subcategorías para Herramientas
    const subcategoriasHerramientas = [
      { name: 'Herramientas Eléctricas', description: 'Taladros, sierras, lijadoras eléctricas' },
      { name: 'Herramientas Manuales', description: 'Martillos, destornilladores, llaves' },
      { name: 'Equipo de Medición', description: 'Niveles, metros, calibradores' }
    ]

    for (const sub of subcategoriasHerramientas) {
      await prisma.category.create({
        data: {
          name: sub.name,
          description: sub.description,
          parentId: herramientas.id
        }
      })
    }

    // Crear subcategorías para Electrodomésticos
    const subcategoriasElectrodomesticos = [
      { name: 'Refrigeradores', description: 'Refrigeradores y congeladores' },
      { name: 'Microondas', description: 'Hornos microondas' },
      { name: 'Cafeteras', description: 'Máquinas de café y dispensadores' },
      { name: 'Aires Acondicionados', description: 'Equipos de climatización' }
    ]

    for (const sub of subcategoriasElectrodomesticos) {
      await prisma.category.create({
        data: {
          name: sub.name,
          description: sub.description,
          parentId: electrodomesticos.id
        }
      })
    }

    console.log('✅ Subcategorías creadas')

    // Mostrar resumen
    const totalCategories = await prisma.category.count()
    const mainCategories = await prisma.category.count({
      where: { parentId: null }
    })
    const subcategories = await prisma.category.count({
      where: { parentId: { not: null } }
    })

    console.log(`\n📊 Resumen:`)
    console.log(`   Total de categorías: ${totalCategories}`)
    console.log(`   Categorías principales: ${mainCategories}`)
    console.log(`   Subcategorías: ${subcategories}`)

    console.log('\n✅ ¡Categorías de ejemplo creadas exitosamente!')

  } catch (error) {
    console.error('❌ Error al crear categorías:', error)
    console.error(error.message)
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories()